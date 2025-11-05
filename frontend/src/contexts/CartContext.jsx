import React, { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext({ items: [], add: ()=>{}, remove: ()=>{}, clear: ()=>{} });
export function useCart(){ return useContext(CartContext); }

export function CartProvider({ children }){
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('gv_cart')||'[]'));
  const save = (arr) => { setItems(arr); localStorage.setItem('gv_cart', JSON.stringify(arr)); };
  const add = (p) => save([...items, p]);
  const remove = (idx) => save(items.filter((_,i)=>i!==idx));
  const clear = () => save([]);
  const value = useMemo(()=>({ items, add, remove, clear }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

