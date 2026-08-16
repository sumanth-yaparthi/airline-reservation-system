using ARSBEWebApplication.Models;

namespace ARSBEWebApplication.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            // Seed Admin user
            if (!context.Users.Any(u => u.Role == "Admin"))
            {
                context.Users.Add(new User
                {
                    FullName = "System Admin",
                    Email = "admin@airline.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = "Admin"
                });
            }

            // Seed a couple of sample flights with seats, only if none exist
            if (!context.Flights.Any())
            {
                var flight1 = new Flight
                {
                    FlightNumber = "AR101",
                    Origin = "New York",
                    Destination = "Los Angeles",
                    DepartureTime = DateTime.UtcNow.AddDays(3).Date.AddHours(9),
                    ArrivalTime = DateTime.UtcNow.AddDays(3).Date.AddHours(12),
                    TotalSeats = 12,
                    Price = 199.99m
                };

                var flight2 = new Flight
                {
                    FlightNumber = "AR202",
                    Origin = "Chicago",
                    Destination = "Miami",
                    DepartureTime = DateTime.UtcNow.AddDays(5).Date.AddHours(14),
                    ArrivalTime = DateTime.UtcNow.AddDays(5).Date.AddHours(17),
                    TotalSeats = 12,
                    Price = 149.50m
                };

                context.Flights.AddRange(flight1, flight2);
                await context.SaveChangesAsync(); // need IDs before creating seats

                context.Seats.AddRange(GenerateSeats(flight1.Id));
                context.Seats.AddRange(GenerateSeats(flight2.Id));
            }

            await context.SaveChangesAsync();
        }

        private static List<Seat> GenerateSeats(int flightId)
        {
            var seats = new List<Seat>();
            var letters = new[] { "A", "B", "C", "D", "E", "F" };

            // Row 1-2: Business (12 seats total: 2 rows x 6)
            for (int row = 1; row <= 2; row++)
                foreach (var letter in letters)
                    seats.Add(new Seat { FlightId = flightId, SeatNumber = $"{row}{letter}", SeatClass = "Business", IsAvailable = true });

            return seats;
        }
    }
}