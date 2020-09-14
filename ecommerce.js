const Koa = require("koa");
const bodyparser = require("koa-bodyparser");

const server = new Koa();
server.use(bodyparser());

const estoque = [
    {
        id: '0',
        nome: 'camisa',
        quantidadeDisponivel: 30,
        valor: 8000,
        deletado: false
    },

    {
        id: '1',
        nome: 'calça',
        quantidadeDisponivel: 20,
        valor: 10000,
        deletado: false
    }
];

const pedidos = [
    {
        id: '0',
        listaProdutos: [],
        estado: 'incompleto',
        idCliente: '1',
        deletado: false,
        valorTotal: 0
    },

    {
        id: '1',
        listaProdutos: [{
            id: "0",
            nome: "camisa",
            quantidade: 10,
            valor: 80
        }],
        estado: 'incompleto',
        idCliente: '1',
        deletado: false,
        valorTotal: 80000
    },

    {
        id: '2',
        listaProdutos: [{
            id: "0",
            nome: "camisa",
            quantidade: 5,
            valor: 80
        }],
        estado: 'pago',
        idCliente: '1',
        deletado: false,
        valorTotal: 4000
    }
];

/**
 * Funcionalidades dos produtos/estoque
 */

const criarProduto = (novoProduto) => {

    novoProduto = {
        id: novoProduto.id,
        nome: novoProduto.nome,
        quantidadeDisponivel: novoProduto.quantidadeDisponivel,
        valor: novoProduto.valor * 100,
        deletado: false
    }

    estoque.push(novoProduto)
    return estoque

}

const verficarSeJaExiste = (id) => {
    let encontrado = false
    for (i = 0; i < estoque.length; i++) {
        if (estoque[i].id === id)
        encontrado = true
    }
  
return encontrado
    
}

const listarTodosProdutos = () => {
    return estoque
}


const listarProduto = (id) => {
    let produto = estoque[id]
    if (produto) {
        return produto
    } 
}

const atualizarProduto = (id, body) => {
    let produto = estoque[id]

        produto.nome = body.nome
        produto.quantidadeDisponivel = body.quantidadeDisponivel
        produto.valor = body.valor * 100

 return produto

}

const verificarDeletado = (id) => {
    let produto = estoque[id] 
    return produto.deletado
    
}

const deletarProduto = (id) => {
    let produto = estoque[id]
    produto.deletado = true

    return produto
}


/**
 * Funcionalidades dos pedidos
 * 
 */

const atualizarQuantidadeCompra = (id, quantidade) => {
    let produto = estoque[id]
        produto.quantidadeDisponivel -= quantidade 

    
    return estoque 

}

const criarPedido = (novoPedido) => {
    
    let meusProdutos = novoPedido.listaProdutos 

    let somaTotal = meusProdutos.reduce((acc, x, i) => {
        return acc + (meusProdutos[i].valor * meusProdutos[i].quantidade * 100) 
    }, 0)


    novoPedido = {
      id: novoPedido.id,
      listaProdutos: novoPedido.listaProdutos,
      estado: 'incompleto',
      idCliente: novoPedido.idCliente,
      deletado: false,
      valorTotal: somaTotal
    }
   
    pedidos.push(novoPedido)
   
    for (i = 0; i < meusProdutos.length; i++) {
        atualizarQuantidadeCompra(meusProdutos[i].id, meusProdutos[i].quantidade)
    }
    
    return novoPedido
    }


const verificarDeletadoNoPedido = (listaProdutos) => {
    for (i = 0; i < listaProdutos.length; i++) {
        let produto = estoque[i]
        if (produto.deletado) {
            deletado = true
            return produto
       
    }    
}
  
}

const verificarQuantidadeNoEstoque = (listaProdutos) => {
    for (i = 0; i < listaProdutos.length; i++) {
        let produto = estoque[i]
        if (produto.quantidadeDisponivel === 0 || produto.quantidadeDisponivel < listaProdutos[i].quantidade) {
            return produto
        }
    }
}

const listarTodosPedidos = () => {
    for (i = pedidos.length - 1; i >= 0; i--) {
        if (pedidos[i].estado === 'cancelado') {
           pedidos.splice(i, 1)
        }
   }
   return pedidos
}

const listarPedido = (id) => {
    let pedido = pedidos[id]
    if (pedido && !pedido.deletado) {
        return pedido
        
    } 
}

const listarCancelados = () => {
    let cancelados = pedidos.filter((x, i) => pedidos[i].estado === 'cancelado')
    return cancelados
}

const listarEntregues = () => {
    let entregues = pedidos.filter((x, i) => pedidos[i].estado === 'entregue')
    return entregues
}

const listarPagos = () => {
    let pagos = pedidos.filter((x, i) => pedidos[i].estado === 'pago')
    return pagos
}

const listarProcessando = () => {
    let emProcessamento = pedidos.filter((x, i) => pedidos[i].estado === 'processando')
    return emProcessamento
}

const verificarEstado = (id) => { 
    let estado = pedidos[id].estado
    return estado === 'incompleto' ? 
    'incompleto' : (estado === 'processando' ?
    'processando' : (estado === 'pago' ?
    'pago' : (estado ===  'enviado' ?
    'enviado' : (estado === 'entregue' ?
    'entregue' : (estado === 'cancelado' ?
    'cancelado': 'não foi possível identificar o estado')))))
}

const verificarListaVazia = (id) => {
    let lista = pedidos[id].listaProdutos
    return lista.length === 0 ? true : false
}

const atualizarEstadoPedido = (id, estado) => { 
    pedidos[id].estado = estado
    return pedidos[id]
}


const atualizarProdutosDoPedido = (id, body) => {
    
    let lista = pedidos[id].listaProdutos
    let achouIgual = false

    for (i= 0; i < lista.length; i++) {
        for (j = 0; j < body.length; j++) {
            if (lista[i].id === body[j].id) {
                achouIgual = true
                if (lista[i].quantidade > body[j].quantidade) {
                    estoque[lista[i].id].quantidadeDisponivel += (lista[i].quantidade - body[j].quantidade)
                } else {
                    atualizarQuantidadeCompra(lista[i].id, body[j].quantidade - lista[i].quantidade) 
                }
                lista[i].quantidade = body[j].quantidade
                pedidos[id].valorTotal = body.reduce((acc, x, i) => {
                    return acc + (body[i].valor * body[i].quantidade * 100) 
                }, 0)
    
            }
            
        }
    }

    if (!achouIgual) {
        lista.push(body)
        let somaNovosProdutos = body.reduce((acc, x, i) => {
            return acc + (body[i].valor * body[i].quantidade * 100) 
        }, 0)
    
        pedidos[id].valorTotal += somaNovosProdutos
        for (i = 0; i < body.length; i++) {
            atualizarQuantidadeCompra(body[i].id, body[i].quantidade) 
        }
    
    }

  return pedidos[id]

  
}

server.use((ctx) => {

    let body = ctx.request.body
    let caminho = ctx.originalUrl.split("/")
    let id = caminho[2]
    
    if (ctx.originalUrl.includes('/products')) {
        if (ctx.method === 'GET' && id) {
           
            let achouProduto = listarProduto(id)
            if (achouProduto) {
                ctx.status = 200
                ctx.body = {
                    status: 'sucesso',
                    dados: achouProduto
                }
            } else {
                ctx.status = 404
                ctx.body = {
                    status:  'erro',
                    dados: {
                        mensagem: 'Produto não encontrado'
                    }
                }
            }
           
        } else if (ctx.method === 'GET') {
            ctx.status = 200
            ctx.body = {
                status: 'sucesso',
                dados: listarTodosProdutos()
            }
        } else if (ctx.method === 'POST') {
           let jaExiste = verficarSeJaExiste(ctx.request.body.id) 
           if (jaExiste) {
            ctx.status = 403
            ctx.body = {
                status:  'erro',
                dados: {
                    mensagem: 'O produto já existe! Atualize o produto!'
                }
            }
           } else {
            ctx.status = 201
            ctx.body = {
                status: 'sucesso',
                dados: criarProduto(body)
            }
           }
           
        } else if (ctx.method === 'PUT' && id) {
            
            let deletado = verificarDeletado(id)
            if (deletado) {
                ctx.status = 403
                ctx.body = {
                    status:  'erro',
                    dados: {
                        mensagem: 'O produto foi deletado e não pode ser atualizado'
                    }
                }
            } else {
                ctx.status = 200
                 ctx.body = {
                status: 'sucesso',
                dados: atualizarProduto(id, body)
            }
        }
            
     } else if (ctx.method === 'PUT') {
        ctx.status = 400
        ctx.body = {
            status:  'erro',
            dados: {
                mensagem: 'Você precisa passar um id'
            }
        }
     } else if (ctx.method === 'DELETE' && id) {
        ctx.status = 200
        ctx.body = {
            status: 'sucesso',
            dados: deletarProduto(id)
        }

     } else if (ctx.method === 'DELETE') {
        ctx.status = 400
        ctx.body = {
            status:  'erro',
            dados: {
                mensagem: 'Você precisa passar um id'
            }
        }
     }   
            
} else if (ctx.originalUrl.includes('/orders')) {
        if (ctx.method === 'POST') {
            let pedidoComDeletado = verificarDeletadoNoPedido(ctx.request.body.listaProdutos) 
            if (!pedidoComDeletado) {
                let naoTemQuantidade = verificarQuantidadeNoEstoque(ctx.request.body.listaProdutos)
                if (naoTemQuantidade) {
                    ctx.status = 403
                    ctx.body = {
                        status:  'erro',
                        dados: {
                            mensagem: `Não temos quantidade suficiente de ${naoTemQuantidade.nome} para o seu pedido`
                        }
                    }
                } else {
                    ctx.status = 201
                    ctx.body = {
                        status: 'sucesso',
                        dados: criarPedido(body)
                    }
                }
            } else {
                ctx.status = 403
                ctx.body = {
                    status: 'erro',
                    dados: {
                        mensagem: `O produto ${pedidoComDeletado.nome} foi deletado. Você não pode adicioná-lo ao pedido.`
                    }
                }
            }
          
        } else if (ctx.method === 'GET' && id) {
                if (id === 'entregues') {
                ctx.status = 200
                ctx.body = {
                    status: 'sucesso',
                    dados: listarEntregues()
                }  
            } else if (id === 'pagos') {
                ctx.status = 200
                ctx.body = {
                    status: 'sucesso',
                    dados: listarPagos()
                }
            } else if (id === 'processando') {
                ctx.status = 200
                ctx.body = {
                    status: 'sucesso',
                    dados: listarProcessando()
                }
            } else if (id === 'cancelados') {
                ctx.status = 200
                ctx.body = {
                    status: 'sucesso',
                    dados: listarCancelados()
                }
            } else {
                    let achouPedido = listarPedido(id)
                    if (achouPedido) {
                    ctx.status = 200
                    ctx.body = {
                        status: 'sucesso',
                        dados: achouPedido
                    }
                } else {
                    ctx.status = 404
                    ctx.body = {
                        status:  'erro',
                        dados: {
                            mensagem: 'Pedido não encontrado'
                        }
                    }
                }
        }
        } else if (ctx.method === 'GET') {
            ctx.status = 200
            ctx.body = {
                status: 'sucesso',
                dados: listarTodosPedidos()
            }
        } else if (ctx.method === 'PUT' && id && ctx.request.body.listaProdutos) {
            let achouPedido = listarPedido(id)
            if (achouPedido) {
                let estadoPedido = verificarEstado(id) 
                if (estadoPedido === 'incompleto') {
                    let naoTemQuantidade = verificarQuantidadeNoEstoque(ctx.request.body.listaProdutos)
                    if (naoTemQuantidade) {
                    ctx.status = 403
                    ctx.body = {
                        status:  'erro',
                        dados: {
                            mensagem: `Não temos quantidade suficiente de ${naoTemQuantidade.nome} para o seu pedido`
                        }
                    }
                } else {
                    ctx.status = 200
                    ctx.body = {
                        status: 'sucesso',
                        dados: atualizarProdutosDoPedido(id, ctx.request.body.listaProdutos)
                    }
                }
                  
                } else {
                    ctx.status = 403
                                ctx.body = {
                                    status:  'erro',
                                    dados: {
                                        mensagem: 'Você não pode adicionar novos produtos a um pedido com estado diferente de incompleto'
                                    }
                                }
                }
                
            } else {
                ctx.status = 404
                ctx.body = {
                    status:  'erro',
                    dados: {
                        mensagem: 'Pedido não encontrado'
                    }
                }  
            }         
                
        } else if (ctx.method === 'PUT' && id) {
            let achouPedido = listarPedido(id)    
                if (achouPedido) {
                        let estadoPedido = verificarEstado(id)
                        if (estadoPedido === 'incompleto') {
                            let listaVazia = verificarListaVazia(id)
                            if (listaVazia) {
                                ctx.status = 403
                                ctx.body = {
                                    status:  'erro',
                                    dados: {
                                        mensagem: 'A lista de Produtos está vazia. Adicione produtos para mudar o status.'
                                    }
                                }
                            } else {
                                ctx.status = 200
                                 ctx.body = {
                                    status: 'sucesso',
                                     dados: atualizarEstadoPedido(id, ctx.request.body.estado)
                                }
                            }
                          
                        } else if (estadoPedido === 'cancelado') {
                            ctx.status = 403
                                ctx.body = {
                                    status:  'erro',
                                    dados: {
                                        mensagem: 'O pedido foi cancelado. Você não pode mudar o status. Faça outro pedido'
                                    }
                                }
                        } else {
                            ctx.status = 200
                            ctx.body = {
                               status: 'sucesso',
                                dados: atualizarEstadoPedido(id, ctx.request.body.estado)
                           }
                        }
                         
                } else {
                    ctx.status = 404
                    ctx.body = {
                        status:  'erro',
                        dados: {
                            mensagem: 'Pedido não encontrado'
                        }
                    }
                }
        
    } else if (ctx.method === 'PUT') {
        ctx.status = 400
        ctx.body = {
            status:  'erro',
            dados: {
                mensagem: 'Você precisa passar um id'
            }
        }
    }

} else {
    ctx.status = 404
    ctx.body = {
        status:  'erro',
        dados: {
            mensagem: 'Conteúdo não encontrado'
        }
    }
}

});

server.listen(8081, () => console.log("O servidor está rodando"));