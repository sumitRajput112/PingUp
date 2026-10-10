import React from 'react'
import { assets } from '../assets/assets'
import { Star } from 'lucide-react'
import { SignIn} from '@clerk/react'

const Login = () => {
  return (
    <div className='min-h-screen flex flex-col md:flex-row bg-linear-to-br from-white via-[#F5F3FF] to-[#E9D5FF]'>

      {/* left side:Branding */}
      <div className='flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40'>
        <div className='flex items-center gap-3'>
          <img src="/conexa-logo-192.png" alt="Conexa" className='h-14 w-14 md:h-16 md:w-16 rounded-2xl' />
          <div className='leading-tight'>
            <h2 className='text-3xl md:text-4xl font-extrabold tracking-wide text-[#1E1B4B]' style={{ fontFamily: 'Outfit, sans-serif' }}>
              CONE<span className='bg-linear-to-r from-[#2563EB] to-[#D946EF] bg-clip-text text-transparent'>X</span>A
            </h2>
            <p className='text-xs md:text-sm tracking-widest text-gray-400'>Connect • Share • Grow</p>
          </div>
        </div>
        <div>
            <div className='flex items-center gap-3 mb-4 max-md:mt-10'>
                <img src={assets.group_users} alt="" className='h-8 md:h-10'/>
                <div>
                    <div className='flex'>
                        {Array(5).fill(0).map((_,i)=>(
                            <Star key={i} className='size-4 md:size-4.5 text-transparent fill-amber-500'/>
                        ))}
                    </div>
                    <p className='text-[#1E1B4B]'> Join <span className='font-semibold text-[#2563EB]'>10K+</span> active members</p>
                </div>
            </div>
            <h1 className='text-3xl md:text-6xl md:pb-2 font-bold text-[#1E1B4B]'>
              More than just friends{' '}
              <span className='bg-linear-to-r from-[#2563EB] to-[#D946EF] bg-clip-text text-transparent'>truly connect</span>
            </h1>
            <p className='text-xl md:text-3xl text-gray-500 max-w-72 md:max-w-md'>Join a community where people share their thoughts, stories and grow together.</p>
        </div>
        <span className='md:h-10'></span>
      </div>
      {/* Right side login page */}
      <div className='flex-1 flex items-center justify-center p-6 sm:p-10'>
         <SignIn />
      </div>
    </div>
  )
}

export default Login