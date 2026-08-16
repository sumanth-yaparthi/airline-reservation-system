using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ARSBEWebApplication.Models
{
    public class Seat
    {
        public int Id { get; set; }

        public int FlightId { get; set; }
        [ForeignKey(nameof(FlightId))]
        public Flight? Flight { get; set; }

        [Required, MaxLength(5)]
        public string SeatNumber { get; set; } = string.Empty; // e.g. "12A"

        [Required, MaxLength(20)]
        public string SeatClass { get; set; } = "Economy"; // Economy / Business / FirstClass

        public bool IsAvailable { get; set; } = true;

        public ICollection<ReservationSeat> ReservationSeats { get; set; } = new List<ReservationSeat>();
    }
}
