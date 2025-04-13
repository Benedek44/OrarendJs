document.addEventListener('DOMContentLoaded', async () => {
  const timetable = document.getElementById('timetable');
  const addForm = document.getElementById('add-form'); 
  const editForm = document.getElementById('edit-form');
  const editContainer = document.getElementById('edit-container');
  const cancelEditButton = document.getElementById('cancel-edit');
  const daysOfWeek = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek'];
  let timetableData = [];

  async function fetchTimetable() {
    try {
        const response = await fetch('/classes');
        if (response.ok) {
            timetableData = await response.json();
            console.log('Fetched timetable data:', timetableData);
            renderTable();
        } else {
            console.error('Failed to fetch timetable:', await response.json());
        }
    } catch (error) {
        console.error('Failed to fetch timetable:', error);
    }
  }

  function renderTable() {
    // Determine the maximum class number dynamically
    const maxClassNumber = Math.max(8, ...timetableData.map(c => c.classNumber));

    timetable.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Óra</th>
            ${daysOfWeek.map(day => `<th>${day}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${Array.from({ length: maxClassNumber }, (_, i) => {
            const classNumber = i + 1;
            return `
              <tr>
                <td>${classNumber}. Óra</td>
                ${daysOfWeek.map(day => {
                  const classInfo = timetableData.find(c => c.day === day && c.classNumber == classNumber);
                  return `
                    <td>
                      ${classInfo ? `
                        <div class="class-info">
                          <div class="class-name">${classInfo.className}</div>
                          <button class="edit" data-id="${classInfo.id}">Szerkesztés</button>
                          <button class="delete" data-id="${classInfo.id}">Törlés</button>
                        </div>
                      ` : ''}
                    </td>`;
                }).join('')}
              </tr>`;
          }).join('')}
        </tbody>
      </table>`;
    attachEventListeners();
  }

  function attachEventListeners() {
    timetable.querySelectorAll('.edit').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.id;
        editClass(id);
      });
    });

    timetable.querySelectorAll('.delete').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.id;
        deleteClass(id);
      });
    });
  }

  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newClass = Object.fromEntries(new FormData(addForm));
    try {
      const response = await fetch('/class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass),
      });
      if (response.ok) {
        await fetchTimetable();
        addForm.reset();
      }
    } catch (error) {
      console.error('Failed to add class:', error);
    }
  });

  async function editClass(id) {
    console.log('Edit button clicked for ID:', id);
    const classToEdit = timetableData.find(c => c.id == id);
    if (!classToEdit) {
      console.error('Class not found');
      return;
    }

    console.log('Class to edit:', classToEdit);

    Object.entries(classToEdit).forEach(([key, value]) => {
      const input = editForm.querySelector(`[name="${key}"]`);
      if (input) input.value = value;
    });

    editContainer.classList.remove('hidden');
    console.log('Edit container is now visible');
  }

  async function deleteClass(id) {
    try {
      const response = await fetch(`/timetable/${id}`, { method: 'DELETE' });
      if (response.ok) await fetchTimetable();
    } catch (error) {
      console.error('Failed to delete class:', error);
    }
  }

  cancelEditButton.addEventListener('click', () => {
    editForm.reset();
    editContainer.classList.add('hidden');
  });

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    const updatedClass = Object.fromEntries(new FormData(editForm));
    const id = updatedClass.id; // Extract the ID from the form data

    try {
      const response = await fetch(`/class/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedClass),
      });

      if (response.ok) {
        await fetchTimetable(); // Refresh the timetable
        editForm.reset(); // Reset the form
        editContainer.classList.add('hidden'); // Hide the edit container
      } else {
        console.error('Failed to update class:', await response.json());
      }
    } catch (error) {
      console.error('Failed to update class:', error);
    }
  });

  await fetchTimetable();
});