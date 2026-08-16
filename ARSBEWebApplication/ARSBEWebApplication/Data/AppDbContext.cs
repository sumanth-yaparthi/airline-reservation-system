using Microsoft.EntityFrameworkCore;
using ARSBEWebApplication.Models;

namespace ARSBEWebApplication.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }

        public DbSet<User> Users { get; set; }
        public DbSet<Flight> Flights { get; set; }
        public DbSet<Seat> Seats { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<ReservationSeat> ReservationSeats { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ----- Unique constraints -----
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Flight>()
                .HasIndex(f => f.FlightNumber)
                .IsUnique();

            // A seat number must be unique within a given flight
            modelBuilder.Entity<Seat>()
                .HasIndex(s => new { s.FlightId, s.SeatNumber })
                .IsUnique();

            // A seat can only appear once per reservation
            modelBuilder.Entity<ReservationSeat>()
                .HasIndex(rs => new { rs.ReservationId, rs.SeatId })
                .IsUnique();

            // ----- Column types -----
            modelBuilder.Entity<Flight>()
                .Property(f => f.Price)
                .HasColumnType("decimal(10,2)");

            // ----- Relationships -----

            // Flight -> Seats
            modelBuilder.Entity<Seat>()
                .HasOne(s => s.Flight)
                .WithMany(f => f.Seats)
                .HasForeignKey(s => s.FlightId)
                .OnDelete(DeleteBehavior.Restrict);

            // User -> Reservations
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reservations)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Flight -> Reservations
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Flight)
                .WithMany(f => f.Reservations)
                .HasForeignKey(r => r.FlightId)
                .OnDelete(DeleteBehavior.Restrict);

            // Reservation -> ReservationSeats (cascade: deleting a reservation cleans up its seat links)
            modelBuilder.Entity<ReservationSeat>()
                .HasOne(rs => rs.Reservation)
                .WithMany(r => r.ReservationSeats)
                .HasForeignKey(rs => rs.ReservationId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seat -> ReservationSeats
            modelBuilder.Entity<ReservationSeat>()
                .HasOne(rs => rs.Seat)
                .WithMany(s => s.ReservationSeats)
                .HasForeignKey(rs => rs.SeatId)
                .OnDelete(DeleteBehavior.Restrict);
        }

    }
}
