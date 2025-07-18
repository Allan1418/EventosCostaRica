using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;
using EventosCostaRica.Data;
using Microsoft.EntityFrameworkCore; // Ensure you have the correct using directive for DbContext and DbSet

namespace EventosCostaRica.Repository
{
    public interface IRepositoryBase<T> where T : class
    {
        Task<IEnumerable<T>> GetAll();
        Task<T?> GetById(int id);
        Task Add(T entity);
        Task Update(T entity);
        Task Delete(int id);
    }



    public class RepositoryBase<T> : IRepositoryBase<T> where T : class
    {
        protected readonly ContextoDB _context;
        protected readonly DbSet<T> _dbSet;

        public RepositoryBase(ContextoDB context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }

        public async Task<IEnumerable<T>> GetAll()
        {
            return await _dbSet.ToListAsync();
        }

        public async Task<T?> GetById(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task Add(T entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task Update(T entity)
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(int id)
        {
            var entity = await GetById(id);
            if (entity != null)
            {
                _dbSet.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

    }
}
