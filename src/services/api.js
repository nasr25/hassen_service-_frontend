import instance from './loadaxios'

export const httpRequest = (url, options = { method: 'GET' }) => instance(url, options)