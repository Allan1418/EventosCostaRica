using EventosCostaRica.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventosCostaRica.Repository
{
    public interface IRepositoryBoleto : IRepositoryBase<Boleto>
    {
        Task<Boleto?> GetBySeatAsync(int eventoId, int seatRow, int seatColumn);
        Task<List<Boleto>> GetByUserIdAsync(string userId);
        Task<List<Boleto>> GetByEventoIdAsync(int eventoId);

        Task<int> CountByEventoIdAsync(int eventoId);
    }
    public class RepositoryBoleto : RepositoryBase<Boleto>, IRepositoryBoleto
    {
        public RepositoryBoleto(ContextoDB context) : base(context)
        { 
        }

        public async Task<Boleto?> GetBySeatAsync(int eventoId, int seatRow, int seatColumn)
        {
            return await _dbSet.FirstOrDefaultAsync(b => b.EventoId == eventoId && b.SeatRow == seatRow && b.SeatColumn == seatColumn);
        }

        public async Task<List<Boleto>> GetByUserIdAsync(string userId)
        {
            return await _dbSet.Where(b => b.UsuarioId == userId).ToListAsync();
        }

        public async Task<List<Boleto>> GetByEventoIdAsync(int eventoId)
        {
            return await _dbSet.Where(b => b.EventoId == eventoId).ToListAsync();
        }
        public async Task<int> CountByEventoIdAsync(int eventoId)
        {
            return await _dbSet.CountAsync(b => b.EventoId == eventoId);
        }
    }
}
