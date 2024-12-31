export async function getMemberData() {
    try {
      // Get IDs from URL parameters
      const params = new URLSearchParams(window.location.search);
      const memberstackId = params.get('memberId');
      const teamId = params.get('teamId');
  
      console.log('URL Parameters:', {
        memberstackId,
        teamId,
        fullUrl: window.location.href
      });
  
      if (!memberstackId || !teamId) {
        console.error('Missing IDs in URL:', window.location.search);
        throw new Error('Missing member or team ID in URL');
      }
  
      return {
        memberstackId,
        teamId
      };
    } catch (error) {
      console.error('Error getting member data:', error);
      throw error;
    }
  }