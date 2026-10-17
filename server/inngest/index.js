import { Inngest } from "inngest";
import User from '../models/User.js';
import Connection from "../models/Connection.js";
import sendEmail from "../configs/nodeMailer.js";
import Story from "../models/Story.js";
import Message from "../models/Message.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "conexa-app" });

// Escape user-provided text before putting it inside HTML emails
const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]))

// Inngest function to save user data to a database
const syncUserCreation = inngest.createFunction(
    {
        id: 'sync-user-from-clerk',
        triggers: {
            event: 'clerk/user.created'
        }
    },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data
        let username = email_addresses[0].email_address.split('@')[0]

        // check availability of username
        const user = await User.findOne({ username })

        if (user) {
            username = username + Math.floor(Math.random() * 10000)
        }

        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            full_name: [first_name, last_name].filter(Boolean).join(' '),
            profile_picture: image_url,
            username
        }
        await User.findOneAndUpdate(
            { _id: id },
            { $setOnInsert: userData },
            { upsert: true }
        )
    }
)

// Inngest function to update the user data
const syncUserUpdation = inngest.createFunction(
    {
        id: 'update-user-from-clerk',
        triggers: {
            event: 'clerk/user.updated'
        }
    },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data

        const updatedUserData = {
            email: email_addresses[0].email_address,
            full_name: [first_name, last_name].filter(Boolean).join(' '),
            profile_picture: image_url,
        }
        await User.findByIdAndUpdate(id, updatedUserData)
    }
)

// Inngest function to delete user and related data from database
const syncUserDeletion = inngest.createFunction(
    {
        id: 'delete-user-from-clerk',
        triggers: {
            event: 'clerk/user.deleted'
        }
    },
    async ({ event }) => {
        const { id } = event.data
        await User.findByIdAndDelete(id)
        await Connection.deleteMany({ $or: [{ from_user_id: id }, { to_user_id: id }] })
        await Message.deleteMany({ $or: [{ from_user_id: id }, { to_user_id: id }] })
        await User.updateMany({}, { $pull: { followers: id, following: id, connections: id } })
    }
)

// Inngest Function to send Reminder when a new connection request is added
const sendNewConnectionRequestReminder = inngest.createFunction(
    {
        id: "send-new-connection-request-reminder",
        triggers: {
            event: "app/connection-request"
        }
    },
    async ({ event, step }) => {
        const { connectionId } = event.data;

        await step.run('send-connection-request-mail', async () => {
            const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');

            if (!connection || !connection.from_user_id || !connection.to_user_id) {
                return { message: 'Connection or user missing' }
            }

            const subject = `👋 New Connection Request`;
            const body = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Hi ${esc(connection.to_user_id.full_name)},</h2>

                <p>You have a new connection request from ${esc(connection.from_user_id.full_name)} - @${esc(connection.from_user_id.username)}</p>

                <p>Click <a href="${process.env.FRONTEND_URL}/connections"
                    style="color: #1e88e3;">here</a> to accept or reject the request</p>

                <br/>

                <p>Thanks,<br/>Conexa - Stay Connected</p>
            </div> `;

            await sendEmail({
                to: connection.to_user_id.email,
                subject,
                body
            })
            return { message: 'Mail sent.' }
        })

        await step.sleep("wait-for-24-hours", "24h")

        await step.run('send-connection-request-reminder', async () => {
            const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id')

            if (!connection || !connection.from_user_id || !connection.to_user_id) {
                return { message: 'Connection or user missing' }
            }

            if (connection.status === "accepted") {
                return { message: "Already accepted" }
            }

            const subject = `👋 New Connection Request`;
            const body = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Hi ${esc(connection.to_user_id.full_name)},</h2>

                <p>You have a new connection request from ${esc(connection.from_user_id.full_name)} - @${esc(connection.from_user_id.username)}</p>

                <p>Click <a href="${process.env.FRONTEND_URL}/connections"
                    style="color: #1e88e3;">here</a> to accept or reject the request</p>

                <br/>

                <p>Thanks,<br/>Conexa - Stay Connected</p>
            </div> `;

            await sendEmail({
                to: connection.to_user_id.email,
                subject,
                body
            })

            return { message: "Reminder sent." }
        })
    }
)

// Inngest Function to delete story after 24 hours
const deleteStory = inngest.createFunction(
    {
        id: "story-delete",
        triggers: {
            event: "app/story.delete"
        }
    },
    async ({ event, step }) => {
        const { storyId } = event.data;
        await step.sleep('wait-for-24-hours', '24h')
        await step.run("delete-story", async () => {
            await Story.findByIdAndDelete(storyId)
            return { message: 'story deleted.' }
        })
    }
)

// Daily notification: unseen messages from the last 24 hours only
const sendNotificationOfUnseenMessages = inngest.createFunction(
    {
        id: "send-unseen-messages-notification",
        triggers: { cron: "TZ=Asia/Kolkata 0 9 * * *" },
    },
    async ({ step }) => {
        const counts = await step.run('count-unseen', async () => {
            const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
            return await Message.aggregate([
                { $match: { seen: false, createdAt: { $gte: since } } },
                { $group: { _id: '$to_user_id', count: { $sum: 1 } } }
            ])
        })

        for (const { _id: userId, count } of counts) {
            await step.run(`notify-${userId}`, async () => {
                const user = await User.findById(userId)
                if (!user) return { skipped: true }

                await sendEmail({
                    to: user.email,
                    subject: `📩 You have ${count} unseen messages`,
                    body: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Hi ${esc(user.full_name)},</h2>
              <p>You have ${count} unseen messages</p>
              <p>Click <a href="${process.env.FRONTEND_URL}/messages" style="color: #10b981;">here</a> to view them</p>
              <br/>
              <p>Thanks,<br/>Conexa - Stay Connected</p>
            </div>`
                })
                return { sent: true }
            })
        }
        return { message: 'Notification sent', users: counts.length }
    }
)

// Export all Inngest functions
export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    sendNewConnectionRequestReminder,
    deleteStory,
    sendNotificationOfUnseenMessages
];