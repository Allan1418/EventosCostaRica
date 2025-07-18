using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EventosCostaRica.Data;

namespace EventosCostaRica.Repository
{
    public interface IRepositoryUsuario : IRepositoryBase<Usuario>
    {
    }
    public class RepositoryUsuario : RepositoryBase<Usuario>, IRepositoryUsuario
    {
        public RepositoryUsuario(ContextoDB context) : base(context)
        {
        }
    }
}
