using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EventosCostaRica.Data;

namespace EventosCostaRica.Repository
{
    public interface IRepositoryBlockedSeat : IRepositoryBase<BlockedSeat>
    {
    }
    public class RepositoryBlockedSeat : RepositoryBase<BlockedSeat>, IRepositoryBlockedSeat
    {
        public RepositoryBlockedSeat(ContextoDB context) : base(context)
        {
        }
    }
}
