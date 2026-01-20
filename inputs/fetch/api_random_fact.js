const randomApiFetch = async () => {
  const URL = "https://uselessfacts.jsph.pl/random.json";

  try {
    const resp = await fetch(URL);
    if (!resp.ok) {
      throw new Error(`Response :: ${resp.status}`);
    }
    const fact = await resp.json();
    return fact.text;
  } catch (error) {
    throw error;
  }
};

export default randomApiFetch;
