const getBackendUrl = () => {
  const env = process.env.APP_ENV || 'development';
  // if env is production or prod, return the backend host from environment variable
  if (env === 'prod' || env === 'stag') {
    return process.env.APP_BACKEND_HOST || 'backend:5000';
  }
  return 'localhost:5000';
};

export const config = {
  backendUrl: `http://${getBackendUrl()}`
};
