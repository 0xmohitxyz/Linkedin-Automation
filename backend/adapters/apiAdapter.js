import axios from 'axios';


export async function apiAdapter(post) {
  console.log(`[API ADAPTER] Attempting to post to LinkedIn via Official API...`);
  
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const personUrn = process.env.LINKEDIN_PERSON_URN; // e.g., urn:li:person:12345ABCDE

  if (!accessToken || !personUrn) {
    console.warn("[API ADAPTER] LINKEDIN_ACCESS_TOKEN or LINKEDIN_PERSON_URN not set. Failing.");
    throw new Error("Missing LinkedIn API credentials in .env");
  }

  try {
    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        author: personUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: post.content
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("[API ADAPTER] Success! LinkedIn API Response:", response.data);
    return true;
  } catch (err) {
    console.error("[API ADAPTER] Error posting via API:", err.response?.data || err.message);
    throw err;
  }
}
