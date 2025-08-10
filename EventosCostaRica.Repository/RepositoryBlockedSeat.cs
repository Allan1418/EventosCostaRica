using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EventosCostaRica.Data;
using Microsoft.EntityFrameworkCore;

namespace EventosCostaRica.Repository
{
    public interface IRepositoryBlockedSeat : IRepositoryBase<BlockedSeat>
    {
        Task<IEnumerable<BlockedSeat>> GetByEventId(int eventId);
        Task<BlockedSeat?> GetByCoord(int eventId, int row, int column);

        Task<int> CountByEvendoId(int eventId);
    }
    public class RepositoryBlockedSeat : RepositoryBase<BlockedSeat>, IRepositoryBlockedSeat
    {
        public RepositoryBlockedSeat(ContextoDB context) : base(context)
        {
        }

        public async Task<IEnumerable<BlockedSeat>> GetByEventId(int eventId)
        {
            return await _dbSet.Where(bs => bs.EventoId == eventId).ToListAsync();
        }

        public async Task<BlockedSeat?> GetByCoord(int eventId, int row, int column)
        {
            return await _dbSet.Include(bs => bs.Evento).FirstOrDefaultAsync(bs => bs.EventoId == eventId && bs.SeatRow == row && bs.SeatColumn == column);
        }

        public new async Task<BlockedSeat?> GetById(int id)
        {
            return await _dbSet.Include(bs => bs.Evento).FirstOrDefaultAsync(bs => bs.Id == id);
        }

        public async Task<int> CountByEvendoId(int eventId)
        {
            return await _dbSet.CountAsync(bs => bs.EventoId == eventId);
        }
    }
}
