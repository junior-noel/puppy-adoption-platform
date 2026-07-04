const wrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>PawHome</title>
</head>
<body style="margin:0;padding:0;background:#FFF8F0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F0;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#D1701F;padding:28px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                🐾 PawHome
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;color:#2B2420;font-size:15px;line-height:1.7;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background:#FFF8F0;border-top:1px solid #FEEEDC;text-align:center;color:#999;font-size:12px;">
              PawHome — connecting shelters and adopters.<br/>
              You received this email because you have an account on PawHome.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const btn = (href, label) => `
  <a href="${href}"
     style="display:inline-block;margin-top:24px;padding:12px 28px;background:#D1701F;color:#fff;
            text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
    ${label}
  </a>`;

// 1. New application — sent to the SHELTER
export const newApplicationEmail = ({
  shelterName,
  adopterName,
  puppyName,
  dashboardUrl,
}) =>
  wrapper(`
    <p style="margin:0 0 8px;">Hi <strong>${shelterName}</strong>,</p>
    <p>
      Great news — <strong>${adopterName}</strong> has just submitted an adoption
      application for <strong>${puppyName}</strong>.
    </p>
    <p>
      Log in to your shelter dashboard to review the application, read their
      answers, and approve, reject, or waitlist them.
    </p>
    ${btn(dashboardUrl, "Review application")}
    <p style="margin-top:28px;color:#999;font-size:13px;">
      If you weren't expecting this email, you can safely ignore it.
    </p>
  `);

// 2. Application approved — sent to the ADOPTER
export const applicationApprovedEmail = ({
  adopterName,
  puppyName,
  shelterName,
  chatUrl,
}) =>
  wrapper(`
    <p style="margin:0 0 8px;">Hi <strong>${adopterName}</strong>,</p>
    <p>
      🎉 Wonderful news! Your application to adopt <strong>${puppyName}</strong>
      from <strong>${shelterName}</strong> has been <strong style="color:#16a34a;">approved</strong>.
    </p>
    <p>
      Head over to your chat with the shelter to arrange the next steps —
      meeting the puppy, paperwork, and pick-up.
    </p>
    ${btn(chatUrl, "Open chat with shelter")}
    <p style="margin-top:28px;color:#999;font-size:13px;">
      Congratulations and welcome to the PawHome family! 🐾
    </p>
  `);

// 3. Application rejected — sent to the ADOPTER
export const applicationRejectedEmail = ({
  adopterName,
  puppyName,
  shelterName,
  browseUrl,
}) =>
  wrapper(`
    <p style="margin:0 0 8px;">Hi <strong>${adopterName}</strong>,</p>
    <p>
      Thank you for your interest in adopting <strong>${puppyName}</strong>
      from <strong>${shelterName}</strong>.
    </p>
    <p>
      After careful review, the shelter was unable to approve your application
      at this time. This is often due to a high volume of applicants and is
      not a reflection on you personally.
    </p>
    <p>There are plenty of other puppies looking for a loving home.</p>
    ${btn(browseUrl, "Browse other puppies")}
  `);

// 4. Application waitlisted — sent to the ADOPTER
export const applicationWaitlistedEmail = ({
  adopterName,
  puppyName,
  shelterName,
}) =>
  wrapper(`
    <p style="margin:0 0 8px;">Hi <strong>${adopterName}</strong>,</p>
    <p>
      Your application to adopt <strong>${puppyName}</strong>
      from <strong>${shelterName}</strong> has been placed on the
      <strong>waitlist</strong>.
    </p>
    <p>
      This means another applicant is currently being considered first.
      If that application doesn't proceed, the shelter will review yours next.
      We'll email you if your status changes.
    </p>
    <p style="color:#999;font-size:13px;margin-top:20px;">
      No action is needed from you right now — we'll keep you updated.
    </p>
  `);
