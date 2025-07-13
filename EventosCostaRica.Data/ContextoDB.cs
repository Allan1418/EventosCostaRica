using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventosCostaRica.Data
{
    public class ContextoDB : IdentityDbContext<Usuario>
    {
        public ContextoDB(DbContextOptions<ContextoDB> options)
            : base(options)
        {
        }

        public DbSet<Evento> Eventos { get; set; }
        public DbSet<Boleto> Boletos { get; set; }
        public DbSet<BlockedSeat> BlockedSeats { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Boleto>()
                .HasIndex(b => new { b.EventoId, b.SeatRow, b.SeatColumn })
                .IsUnique();

            modelBuilder.Entity<BlockedSeat>()
                .HasIndex(bs => new { bs.EventoId, bs.SeatRow, bs.SeatColumn })
                .IsUnique();
        }
    }
}
