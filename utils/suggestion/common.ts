export const activeTab = '<c:param name="activeTab" value=""/>';

export const row =
  '<div class="layout layout--row layout--align-center layout--gap-16 layout--width-full"></div>';

export const thead = `<thead class="table__thead">
  <tr class="table__thead__row">
  </tr>
</thead>`;

export const tbody = `<tbody class="table__tbody">
</tbody>`;

export const sort = `<div class="table__column__sorter">
    <span class="sort_arrow_asc table__column__sorter__icon \${listForm.sort_column == '5' ? 'table__column__sorter__icon--active' : ''}">▲</span>
    <span class="sort_arrow_desc table__column__sorter__icon \${listForm.sort_column == '-5' ? 'table__column__sorter__icon--active' : ''}">▼</span>
</div>`;
