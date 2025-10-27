/**
 * 
 * @returns List of all stocks
 */
function createStockChoices() {
    const stocks = [
        { name: '$SCAM', value: '$SCAM' },
        { name: '$WC', value: '$WC' },
        { name: '$D20', value: '$D20' },
        { name: '$SS', value: '$SS' },
        { name: '$DAGS', value: '$DAGS' },
        { name: '$RRT', value: '$RRT' },
        { name: '$VFB', value: '$VFB' },
        { name: '$PP', value: '$PP' },
        { name: '$FWI', value: '$FWI' }
    ];
    return stocks;
}

/**
 * 
 * @returns List of all Stocks with All added at the end
 */
function createStockChoicesAll() {
    const stocks = [
        { name: '$SCAM', value: '$SCAM' },
        { name: '$WC', value: '$WC' },
        { name: '$D20', value: '$D20' },
        { name: '$SS', value: '$SS' },
        { name: '$DAGS', value: '$DAGS' },
        { name: '$RRT', value: '$RRT' },
        { name: '$VFB', value: '$VFB' },
        { name: '$PP', value: '$PP' },
        { name: '$FWI', value: '$FWI' },
        { name: "All", value: "all" }
    ];
    return stocks;
}


function createTransactionRequest(user_id, stock_id, type, quantity) {
    const data =
    {
        user_id: user_id,
        stock_id: stock_id,
        type: type,
        quantity: quantity,
    } 

    return {method: 'POST',
        body: JSON.stringify(data),
        headers: {"Content-Type": "application/json"}
    }
}

module.exports = {
    createStockChoices,
    createStockChoicesAll,
    createTransactionRequest
};


