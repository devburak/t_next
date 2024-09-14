function ListComponent({ items, onItemSelect }) {
    return (
      <ul>
        {items && items.map(item => (
          <li key={item.id} className="list-item"  onClick={() => onItemSelect(item.position ||item.positions[0])}>
            {item.popupContent.title}
          </li>
        ))}
      </ul>
    );
  }

  
  export default ListComponent;