using System.ComponentModel.DataAnnotations;

namespace ARSBEWebApplication.DTOs.Reservations
{
    public class CreateReservationDto
    {
        [Required]
        public int FlightId { get; set; }

        [Required, MinLength(1)]
        public List<int> SeatIds { get; set; } = new();
    }
}