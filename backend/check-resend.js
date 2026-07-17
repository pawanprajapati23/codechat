const { Resend } = require('resend');
const resend = new Resend('re_jE8MVmRp_9GsEZcEpijTwcUv7eTNwfKyn');

async function test() {
  try {
    const { data, error } = await resend.domains.list();
    console.log("DOMAINS:", JSON.stringify(data, null, 2));
    if (error) console.log("ERROR:", error);
  } catch (e) {
    console.log("CATCH ERROR:", e);
  }
}
test();
