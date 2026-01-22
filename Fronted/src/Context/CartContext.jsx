import React, {createContext, useContext, useReducer, useEffect} from 'react'

const CartContext = createContext()

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TO_CART':
            const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
            if (existingIndex > -1) {
                const newItems = [...state.items];
                newItems[existingIndex].quantity += 1;
                return {...state, items: newItems};
            }
            return {...state, items: [...state.items, {...action.payload, quantity: 1}]}
        
        case 'REMOVE_FROM_CART':
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload)
            };

        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map(item => item.id === action.payload.id
                                            ? {...item, quantity: Math.max(1, action.payload.quantity)}
                                            : item
                )
            }

        case 'CLEAR_CART':
            return {...state, items:[]};

        case 'LOAD_CART':
            return {...state, items: action.payload}

        default:
            return state;
    }
}

export const CartProvider = ({children}) => {
    const [state, dispatch] = useReducer(cartReducer, {items:[]})

    useEffect(() => {
        const saved = localStorage.getItem('cart');
        if (saved) {
            dispatch({ type: 'LOAD_CART', payload: JSON.parse(saved)})
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(state.items))
    }, [state.items])


    const addToCart = (product) => dispatch({type: 'ADD_TO_CART', payload:product})
    const removeFromCart = (id) => dispatch({type: 'REMOVE_FROM_CART', payload:id})
    const updateQuantity = (id, quantity) => dispatch({type: 'UPDATE_QUANTITY', payload:{id, quantity}})
    const clearCart = () => dispatch({type: 'CLEAR_CART'})
    
    const cartTotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    
    return (
        <CartContext.Provider value={{cart: state.items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount}}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context;
}
    

