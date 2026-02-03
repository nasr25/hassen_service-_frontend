import instance from './loadaxios'

export const httpRequest = (url, options = { method: 'GET' }) => {
  return instance({
    url,
    ...options
  })
}