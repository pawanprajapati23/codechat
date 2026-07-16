const { Resend } = require('resend');
const resend = new Resend('re_jE8MVmRp_9GsEZcEpijTwcUv7eTNwfKyn');

async function test() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'CodeChat <onboarding@resend.dev>',
      to: 'test@example.com', // random email to trigger the verified domain error
      subject: 'Test',
      html: '<p>Test</p>'
    });
    console.log("Response:", data, error);
  } catch (err) {
    console.log("Catch Error:", err);
  }
}
test();
