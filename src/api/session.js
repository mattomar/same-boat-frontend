export const startSession = async () => {
    try {
      const response = await fetch('http://localhost:3000/user/start-session', {
        method: 'GET',
        credentials: 'include', // <== important to send/receive cookies
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Session start failed:', error);
      return null;
    }
  };