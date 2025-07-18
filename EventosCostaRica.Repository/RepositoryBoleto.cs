using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EventosCostaRica.Data;

namespace EventosCostaRica.Repository
{
    public interface IRepositoryBoleto : IRepositoryBase<Boleto>
    {
    }
    public class RepositoryBoleto : RepositoryBase<Boleto>, IRepositoryBoleto
    {
        public RepositoryBoleto(ContextoDB context) : base(context)
        {
        }
    }
}
