export async function subirImagenDesdeFrontend(file) {
  const formData = new FormData();
  formData.append('imagen', file);

  const res = await fetch('http://localhost:4000/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Error al subir la imagen al servidor');
  }

  const data = await res.json();
  return data.url; // URL local devuelta por el servidor
}
