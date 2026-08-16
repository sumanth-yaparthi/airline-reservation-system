using System.ComponentModel.DataAnnotations;

namespace ARSBEWebApplication.DTOs.Flights
{
    public class CreateFlightDto
    {
        [Required, MaxLength(10)]
        public string FlightNumber { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Origin { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Destination { get; set; } = string.Empty;

        [Required]
        public DateTime DepartureTime { get; set; }

        [Required]
        public DateTime ArrivalTime { get; set; }

        [Range(1, 500)]
        public int TotalSeats { get; set; }

        [Range(0.01, 100000)]
        public decimal Price { get; set; }

        // How many rows of each class to auto-generate seats for, e.g. 20 Economy, 4 Business
        public int EconomySeats { get; set; }
        public int BusinessSeats { get; set; }
    }
}