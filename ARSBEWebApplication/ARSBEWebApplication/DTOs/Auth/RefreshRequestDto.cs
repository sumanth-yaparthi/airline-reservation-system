using System.ComponentModel.DataAnnotations;

namespace ARSBEWebApplication.DTOs.Auth
{
    public class RefreshRequestDto
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
}