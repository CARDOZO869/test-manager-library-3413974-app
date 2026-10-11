import { useState } from 'react';
import api from '../services/api';
import { useCollection } from '../services/useCollection';
import { useMemberNames } from '../services/useMemberNames';
import { Pagination } from '../components/Pagination';
import { ResourceStatus } from '../components/ResourceStatus';

export const Loans = () => {
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [memberFilter, setMemberFilter] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [memberQuery, setMemberQuery] = useState('');
  const [bookQuery, setBookQuery] = useState('');
  const [selectedTitles, setSelectedTitles] = useState({});
  const [loanForm, setLoanForm] = useState({ member_id: '', book_ids: [] });
  const [formError, setFormError] = useState('');
  const [selectedBooks, setSelectedBooks] = useState([]);

  const collection = useCollection('/loans', { page, size: 20, status: status || undefined, from: from || undefined, to: to || undefined, member_id: memberFilter || undefined });
  const overdueCollection = useCollection('/loans/overdue');
  const loans = collection.data.items;
  const memberNames = useMemberNames(loans);
  const filterMembers = useCollection('/members', {q:filterQuery || undefined,size:50});
  const overdue = overdueCollection.data.items;
  const fetchLoans = collection.reload;
  const fetchOverdue = overdueCollection.reload;
  const { totalPages } = collection;
  const error = collection.error || overdueCollection.error;
  const loading = collection.loading || overdueCollection.loading;
  const memberOptions = useCollection(showCreate ? '/members' : null, { q: memberQuery || undefined, size: 50 });
  const bookOptions = useCollection(showCreate ? '/books' : null, { q: bookQuery || undefined, size: 50 });
  const members = memberOptions.data.items;
  const books = bookOptions.data.items.filter(book => book.available_copies > 0);

  const handleReturn = async (loanId, itemId) => {
    try {
      await api.post(`/loans/${loanId}/items/${itemId}/return`);
      fetchLoans();
      fetchOverdue();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'No se pudo registrar la devolución';
      alert(msg);
    }
  };

  const openCreate = () => {
    setFormError('');
      setLoanForm({ member_id: '', book_ids: [] });
      setMemberQuery(''); setBookQuery(''); setSelectedTitles({});
      setSelectedBooks([]);
      setShowCreate(true);
  };

  const toggleBook = (bookId) => {
    const book = books.find(item => item.id === bookId);
    if (book) setSelectedTitles(titles => ({ ...titles, [bookId]: book.title }));
    setSelectedBooks(prev => {
      if (prev.includes(bookId)) return prev.filter(id => id !== bookId);
      if (prev.length >= 3) return prev;
      return [...prev, bookId];
    });
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    setFormError('');
    if (selectedBooks.length === 0) { setFormError('Selecciona al menos un libro'); return; }
    try {
      await api.post('/loans', { member_id: loanForm.member_id, items: selectedBooks.map(book_id => ({ book_id })) });
      setShowCreate(false);
      fetchLoans();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'No se pudo registrar el préstamo';
      setFormError(msg);
    }
  };

  const displayLoans = tab === 'overdue' ? overdue.map(row => ({id: row.item_id, member_name: row.member_name, items: [{id: row.item_id, loan_id: row.loan_id, book_title: row.book_title, due_at: row.due_at, days_late: row.days_late, returned_at: null}]})) : loans;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <ResourceStatus error={error} loading={loading} />
        <h1 className="text-3xl font-bold">Préstamos</h1>
        <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Nuevo préstamo</button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded ${tab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >Todos</button>
        <button
          onClick={() => setTab('overdue')}
          className={`px-4 py-2 rounded ${tab === 'overdue' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >Vencidos ({overdue.length})</button>
      </div>

      {tab === 'all' && <div className="mb-4 flex flex-wrap gap-3"><label>Estado <select value={status} onChange={e => {setStatus(e.target.value); setPage(1);}}><option value="">Todos</option><option value="open">Abiertos</option><option value="overdue">Vencidos</option><option value="closed">Cerrados</option></select></label><label>Desde <input type="date" value={from} onChange={e => {setFrom(e.target.value); setPage(1);}} /></label><label>Hasta <input type="date" value={to} onChange={e => {setTo(e.target.value); setPage(1);}} /></label></div>}
      {tab === 'all' && <div className="mb-4 flex flex-wrap gap-3"><input aria-label="Buscar socio para filtrar préstamos" placeholder="Buscar socio para filtrar" className="rounded border p-2" value={filterQuery} onChange={e => setFilterQuery(e.target.value)} /><select aria-label="Filtrar préstamos por socio" className="rounded border p-2" value={memberFilter} onChange={e => {setMemberFilter(e.target.value); setPage(1);}}><option value="">Todos los socios</option>{filterMembers.data.items.map(member => <option key={member.id} value={member.id}>{member.full_name} ({member.document_number})</option>)}</select></div>}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nuevo préstamo</h2>
            <ResourceStatus error={memberOptions.error || bookOptions.error} loading={memberOptions.loading || bookOptions.loading} />
            {formError && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{formError}</div>}
            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Socio</label>
                <input aria-label="Buscar socio para préstamo" placeholder="Buscar socio por nombre o documento" className="my-2 w-full rounded border p-2" value={memberQuery} onChange={e => {setMemberQuery(e.target.value); setLoanForm({...loanForm,member_id:''});}} />
                <select required className="mt-1 block w-full border border-gray-300 rounded p-2" value={loanForm.member_id} onChange={e => setLoanForm({...loanForm, member_id: e.target.value})}>
                  <option value="">Selecciona un socio…</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.full_name} ({m.document_number})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Libros (máximo 3, seleccionados: {selectedBooks.length})</label>
                <input aria-label="Buscar libro para préstamo" placeholder="Buscar libro por título o autor" className="mb-2 w-full rounded border p-2" value={bookQuery} onChange={e => setBookQuery(e.target.value)} />
                <ul>{selectedBooks.map(id => <li key={id}>{selectedTitles[id]} <button type="button" onClick={() => toggleBook(id)} aria-label={`Quitar ${selectedTitles[id]}`}>×</button></li>)}</ul>
                <div className="border rounded max-h-60 overflow-y-auto p-2 space-y-1">
                  {books.map(b => (
                    <label key={b.id} className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 ${selectedBooks.includes(b.id) ? 'bg-blue-50 border border-blue-200' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selectedBooks.includes(b.id)}
                        onChange={() => toggleBook(b.id)}
                        disabled={!selectedBooks.includes(b.id) && selectedBooks.length >= 3}
                      />
                      <span className="flex-1">{b.title}</span>
                      <span className="text-xs text-gray-500">({b.available_copies} disponibles)</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Registrar préstamo</button>
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {displayLoans.map(loan => (
          <div key={loan.id} className="bg-white p-4 rounded shadow border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold">Préstamo: {loan.id?.substring(0, 8)}...</h3>
                <p className="text-sm text-gray-500">Socio: {loan.member_name || memberNames[loan.member_id] || 'Consultando socio…'}</p>
                <p className="text-sm text-gray-500">Fecha: {loan.loaned_at ? new Date(loan.loaned_at).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
            <div className="overflow-x-auto"><table className="min-w-[450px] w-full text-left text-sm border-t">
              <thead>
                <tr>
                  <th className="pb-2 pt-2">Libro</th>
                  <th className="pb-2 pt-2">Vencimiento</th>
                  <th className="pb-2 pt-2">Estado</th>
                  <th className="pb-2 pt-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {loan.items?.map(item => (
                  <tr key={item.id} className="border-t">
                    <td className="py-2">{item.book_title}</td>
                    <td className="py-2">{item.due_at ? new Date(item.due_at).toLocaleDateString() : 'N/A'}{tab === 'overdue' && <div>{item.days_late} días de retraso</div>}</td>
                    <td className="py-2">
                      {item.returned_at ? (
                        <span className="text-green-600 font-bold">Devuelto</span>
                      ) : new Date(item.due_at) < new Date() ? (
                        <span className="text-red-600 font-bold">Vencidos</span>
                      ) : (
                        <span className="text-yellow-600 font-bold">Activo</span>
                      )}
                    </td>
                    <td className="py-2">
                      {!item.returned_at && (
                        <button
                          onClick={() => handleReturn(item.loan_id || loan.id, item.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                        >Devolver</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        ))}
        {displayLoans.length === 0 && !loading && !error && <p className="text-center text-gray-500 mt-8">No se encontraron préstamos.</p>}
      </div>
      {tab === 'all' && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
    </div>
  );
};
