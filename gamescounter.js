 // Token de acesso pessoal
const token = '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';

// Nome do usuário e nome do repositório
const username = 'Oozaru341';
const repo = 'ClickJogos';
const subpasta = 'jogos';

 // Função para contar as páginas HTML na subpasta
        function contarPaginas() {
            fetch(`https://api.github.com/repos/${username}/${repo}/contents/${subpasta}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Inclua o token no cabeçalho
                    Accept: 'application/vnd.github.v3+json'
                }
            })
            .then(response => response.json())
            .then(data => {
                const paginasHTML = data.filter(file => file.name.endsWith('.html'));
                document.getElementById("numero").textContent = paginasHTML.length;
            })
            .catch(error => {
                console.error(error);
                document.getElementById("numero").textContent = "Erro na contagem de páginas";
            });
        }

        contarPaginas(); // Chama a função para contar as páginas