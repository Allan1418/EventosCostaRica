using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EventosCostaRica.Data;

namespace EventosCostaRica.Repository
{
    public interface IRepositoryEvento : IRepositoryBase<Evento>
    {

    }

    public class RepositoryEvento : RepositoryBase<Evento>, IRepositoryEvento
    {
        public RepositoryEvento(ContextoDB context) : base(context)
        {
        }
    }
}
