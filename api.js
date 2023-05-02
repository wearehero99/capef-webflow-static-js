async function authFetch(url, options = {}) {
  try {
   let token = localStorage.getItem('authToken');

    const headers = {
      ...options.headers,
      "Authorization": `Bearer ${token}`
    };

    const dataResponse = await fetch(url, {
      ...options,
      headers
    });

    if (!dataResponse.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await dataResponse.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

export default authFetch
