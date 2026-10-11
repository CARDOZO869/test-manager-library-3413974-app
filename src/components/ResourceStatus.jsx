import { Icon } from './Icon';
export function ResourceStatus({ error, loading }) {
  return <>{loading && <p role="status" className="resource-loading"><span className="loading-dot"/>Cargando información…</p>}{error && <p role="alert" className="form-error resource-error"><Icon name="close" size={15}/>{error}</p>}</>;
}
