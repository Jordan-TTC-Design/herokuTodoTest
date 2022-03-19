const http = require('http');
const errorHandler = require('./errorHandler');
const todos = [];
const { v4: uuidv4 } = require('uuid');
const headers = {
  'Access-Control-Allow-Headers':
    'Content-Type ,Authorization,Content-Length,X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH,POST,GET,OPTIONS,DELETE',
  'Content-Type': 'application/json',
};
const requestListener = (req, res) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  if (req.url === '/') {
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        message: '首頁',
      }),
    );
    res.end();
  } else if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  } else if (req.url === '/todos' && req.method === 'GET') {
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        message: '成功取得資料',
        data: todos,
      }),
    );
    res.end();
  } else if (req.url === '/todos' && req.method === 'DELETE') {
    todos.length = 0;
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        message: '成功刪除全部資料',
      }),
    );
    res.end();
  } else if (req.url.startsWith('/todos/') && req.method === 'DELETE') {
    const itemId = req.url.split('/').pop();
    const itemIndex = todos.findIndex((item) => item.id === itemId);
    if (itemIndex > -1) {
      todos.splice(itemIndex, 1);
      res.writeHead(200, headers);
      res.write(
        JSON.stringify({
          status: 'success',
          message: `成功刪除id為${itemId}的資料`,
        }),
      );
      res.end();
    } else {
      errorHandler(res);
    }
  } else if (req.url === '/todos' && req.method === 'POST') {
    req.on('end', () => {
      try {
        const title = JSON.parse(body).title;
        if (title !== undefined) {
          const item = { title, id: uuidv4() };
          todos.push(item);
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: 'success',
              message: '成功新增一筆資料',
            }),
          );
          res.end();
        } else {
          errorHandler(res);
        }
      } catch (error) {
        console.log(error);
        errorHandler(res);
      }
    });
  } else if (req.url.startsWith('/todos/') && req.method === 'PATCH') {
    req.on('end', () => {
      try {
        const itemId = req.url.split('/').pop();
        const itemIndex = todos.findIndex((item) => item.id === itemId);
        const title = JSON.parse(body).title;
        if (itemIndex > -1 && title !== undefined) {
          todos[itemIndex].title = title;
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: 'success',
              message: `成功修改id為${itemId}的資料`,
            }),
          );
          res.end();
        } else {
          errorHandler(res);
        }
      } catch (error) {
        console.log(error);
        errorHandler(res);
      }
    });
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: 'false',
        message: '找不到頁面',
      }),
    );
    res.end();
  }
};
const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);
