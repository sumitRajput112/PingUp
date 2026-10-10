export const clerkAppearance = {
  variables: {
    colorPrimary: '#5B3FF0',
    colorText: '#1E1B4B',
    borderRadius: '0.75rem',
  },
  elements: {
    formButtonPrimary: {
      background: 'linear-gradient(to right, #2563EB, #A63DF0)',
      color: '#ffffff',
      boxShadow: 'none',
      '&:hover, &:focus, &:active': {
        background: 'linear-gradient(to right, #1D4ED8, #9333EA)',
      },
    },
      footerActionLink: {
      fontWeight: 700,
      '&:hover': {
        color: '#2563EB',
      },
    },
  },
}