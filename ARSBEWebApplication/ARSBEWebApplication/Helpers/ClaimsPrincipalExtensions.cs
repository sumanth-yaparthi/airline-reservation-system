using System.Security.Claims;

namespace ARSBEWebApplication.Helpers
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal user)
        {
            var idClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return idClaim != null ? int.Parse(idClaim) : throw new UnauthorizedAccessException("No user ID found in token.");
        }
    }
}