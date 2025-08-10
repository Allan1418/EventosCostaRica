using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventosCostaRica.Data
{
    public class GridDTO
    {
        public int IdEvento { get; set; }
        public List<GridRowDTO>? rows { get; set; }
    }

    public class GridRowDTO
    {
        public int row { get; set; }
        public List<GridSeatDTO>? seats { get; set; }
    }
    public class GridSeatDTO
    {
        public int row { get; set; }
        public int column { get; set; }
        public TypeGrid type { get; set; }
    }

    public enum TypeGrid
    {
        Disponible,
        Ocupado,
        Bloqueado,
    }

}
