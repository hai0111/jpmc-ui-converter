const suggestions = {
  "Common --> Heading": `<h2 class="heading"></h2>`,
  "Common --> Active Tab": '<c:param name="activeTab" value=""/>',
  "Table --> thead": `<thead class="table__thead">
  <tr class="table__thead__row">
  </tr>
</thead>`,
  "Table --> Sorter": `<div class="table__column__sorter">
    <span class="sort_arrow_asc table__column__sorter__icon \${listForm.sort_column == '5' ? 'table__column__sorter__icon--active' : ''}">▲</span>
    <span class="sort_arrow_desc table__column__sorter__icon \${listForm.sort_column == '-5' ? 'table__column__sorter__icon--active' : ''}">▼</span>
</div>`,
};

export default suggestions;
