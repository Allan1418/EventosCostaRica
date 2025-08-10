using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EventosCostaRica.Data; 


namespace EventosCostaRica.Repository
{
    public interface IRepositoryUsuarios : IRepositoryBase<Usuario>
    {
    }
    public class RepositoryUsuarios : RepositoryBase<Usuario>, IRepositoryUsuarios
    {
        public RepositoryUsuarios(ContextoDB context) : base(context)
        {
        }
    }
}
