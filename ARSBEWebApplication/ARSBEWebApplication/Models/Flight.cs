using System.ComponentModel.DataAnnotations;

namespace ARSBEWebApplication.Models
{
    public class Flight
    {
        public int Id { get; set; }

        [Required, MaxLength(10)]
        public string FlightNumber { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Origin { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Destination { get; set; } = string.Empty;

        public DateTime DepartureTime { get; set; }
        public DateTime ArrivalTime { get; set; }

        public int TotalSeats { get; set; }
        public decimal Price { get; set; }

        public ICollection<Seat> Seats { get; set; } = new List<Seat>();
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
