// Antecedentes (Backgrounds) do D&D 5e - Player's Handbook

export interface BackgroundFeature {
    name: string;
    description: string;
}

export interface Background {
    name: string;
    skillProficiencies: string[]; // 2 perícias
    toolProficiencies?: string[];
    languages?: number; // Número de idiomas extras
    equipment: string[];
    feature: BackgroundFeature;
    suggestedCharacteristics: {
        personalityTraits: string[];
        ideals: string[];
        bonds: string[];
        flaws: string[];
    };
}

export const BACKGROUNDS: Background[] = [
    {
        name: "Acólito",
        skillProficiencies: ["insight", "religion"],
        languages: 2,
        equipment: [
            "Símbolo sagrado",
            "Livro de orações ou roda de orações",
            "5 varetas de incenso",
            "Vestes",
            "Roupas comuns",
            "Bolsa com 15 gp"
        ],
        feature: {
            name: "Abrigo dos Fiéis",
            description: "Como um acólito, você comanda o respeito daqueles que compartilham sua fé. Você e seus companheiros podem esperar receber cura gratuita e cuidados em um templo, santuário ou outra presença estabelecida de sua fé."
        },
        suggestedCharacteristics: {
            personalityTraits: [
                "Eu idolatro um herói particular de minha fé e constantemente me refiro aos feitos e exemplo dessa pessoa.",
                "Eu posso encontrar um terreno comum entre os inimigos mais ferozes, tendo empatia com eles e sempre trabalhando pela paz.",
                "Eu vejo presságios em cada evento e ação.",
                "Nada pode abalar minha atitude otimista."
            ],
            ideals: [
                "Tradição. As antigas tradições de adoração e sacrifício devem ser preservadas e mantidas.",
                "Caridade. Eu sempre tento ajudar aqueles em necessidade.",
                "Mudança. Devemos ajudar a trazer as mudanças que os deuses estão constantemente trabalhando no mundo.",
                "Poder. Espero um dia subir ao topo da hierarquia religiosa de minha fé."
            ],
            bonds: [
                "Eu morreria para recuperar uma relíquia antiga de minha fé que foi perdida há muito tempo.",
                "Eu ainda devo minha vida ao sacerdote que me acolheu quando meus pais morreram.",
                "Tudo que faço é para o povo comum.",
                "Farei qualquer coisa para proteger o templo onde servi."
            ],
            flaws: [
                "Eu julgo os outros severamente e a mim mesmo ainda mais severamente.",
                "Eu deposito muita confiança naqueles que detêm o poder em minha hierarquia religiosa.",
                "Minha piedade às vezes me leva a confiar cegamente naqueles que professam fé em meu deus.",
                "Eu sou inflexível em meu pensamento."
            ]
        }
    },
    {
        name: "Criminoso",
        skillProficiencies: ["deception", "stealth"],
        toolProficiencies: ["Kit de ladrão", "Um tipo de kit de jogo"],
        equipment: [
            "Pé de cabra",
            "Roupas comuns escuras com capuz",
            "Bolsa com 15 gp"
        ],
        feature: {
            name: "Contato Criminal",
            description: "Você tem um contato confiável e de confiança que atua como seu elo de ligação com uma rede de outros criminosos. Você sabe como enviar e receber mensagens de seu contato, mesmo em grandes distâncias."
        },
        suggestedCharacteristics: {
            personalityTraits: [
                "Eu sempre tenho um plano para o que fazer quando as coisas dão errado.",
                "Eu sou sempre calmo, não importa a situação.",
                "A primeira coisa que faço em um novo lugar é anotar as localizações de tudo valioso.",
                "Eu prefiro fazer um novo amigo a um novo inimigo."
            ],
            ideals: [
                "Honra. Eu não roubo de outros no comércio.",
                "Liberdade. Correntes são feitas para serem quebradas.",
                "Caridade. Eu roubo dos ricos para poder ajudar os necessitados.",
                "Ganância. Eu farei o que for preciso para me tornar rico."
            ],
            bonds: [
                "Estou tentando pagar uma dívida antiga que devo a um benfeitor generoso.",
                "Meus ganhos ilícitos vão para sustentar minha família.",
                "Algo importante foi tirado de mim, e eu pretendo roubá-lo de volta.",
                "Eu me tornarei o maior ladrão que já existiu."
            ],
            flaws: [
                "Quando vejo algo valioso, não consigo pensar em mais nada além de roubá-lo.",
                "Quando confrontado com uma escolha entre dinheiro e meus amigos, geralmente escolho o dinheiro.",
                "Se há um plano, vou esquecê-lo. Se não esquecer, vou ignorá-lo.",
                "Eu tenho um 'diga' que revela quando estou mentindo."
            ]
        }
    },
    {
        name: "Herói do Povo",
        skillProficiencies: ["animalHandling", "survival"],
        toolProficiencies: ["Um tipo de ferramenta de artesão", "Veículos (terrestres)"],
        equipment: [
            "Um conjunto de ferramentas de artesão",
            "Uma pá",
            "Uma panela de ferro",
            "Roupas comuns",
            "Bolsa com 10 gp"
        ],
        feature: {
            name: "Hospitalidade Rústica",
            description: "Como você vem das fileiras do povo comum, você se encaixa entre eles com facilidade. Você pode encontrar um lugar para se esconder, descansar ou se recuperar entre os plebeus, a menos que você tenha se mostrado um perigo para eles."
        },
        suggestedCharacteristics: {
            personalityTraits: [
                "Eu julgo as pessoas por suas ações, não por suas palavras.",
                "Se alguém está em apuros, estou sempre pronto para ajudar.",
                "Quando eu decido algo, eu sigo até o fim, não importa o que aconteça.",
                "Eu tenho um forte senso de justiça e sempre tento encontrar a solução mais equitativa para os argumentos."
            ],
            ideals: [
                "Respeito. As pessoas merecem ser tratadas com dignidade e respeito.",
                "Justiça. Ninguém deve receber tratamento preferencial perante a lei.",
                "Liberdade. Tiranos não devem oprimir o povo.",
                "Poder. Se eu ficar forte, posso tomar o que quiser."
            ],
            bonds: [
                "Eu tenho uma família, mas não tenho ideia de onde eles estão.",
                "Eu trabalhei a terra, eu amo a terra, e protegerei a terra.",
                "Um nobre orgulhoso me deu uma surra terrível, e eu vou ter minha vingança.",
                "Minhas ferramentas são símbolos de minha vida passada, e eu as carrego para nunca esquecer minhas raízes."
            ],
            flaws: [
                "O tirano que governa minha terra não vai parar até que eu esteja morto.",
                "Estou convencido da importância de meu destino, e cego aos meus defeitos.",
                "A pessoa que eu amava morreu por causa de um erro que cometi.",
                "Eu tenho problemas para confiar em meus aliados."
            ]
        }
    },
    {
        name: "Nobre",
        skillProficiencies: ["history", "persuasion"],
        toolProficiencies: ["Um tipo de kit de jogo"],
        languages: 1,
        equipment: [
            "Roupas finas",
            "Anel de sinete",
            "Pergaminho de linhagem",
            "Bolsa com 25 gp"
        ],
        feature: {
            name: "Posição de Privilégio",
            description: "Graças ao seu nascimento nobre, as pessoas tendem a pensar o melhor de você. Você é bem-vindo na alta sociedade, e as pessoas assumem que você tem o direito de estar onde quer que esteja."
        },
        suggestedCharacteristics: {
            personalityTraits: [
                "Minha eloquente lisonja faz com que todos com quem falo se sintam a pessoa mais maravilhosa e importante do mundo.",
                "O povo comum me ama por minha bondade e generosidade.",
                "Ninguém poderia duvidar, olhando minha aparência real, que estou acima das massas incultas.",
                "Eu cuido muito da minha aparência e sempre estou na moda."
            ],
            ideals: [
                "Respeito. O respeito que me é devido é devido à minha posição.",
                "Responsabilidade. É meu dever respeitar a autoridade daqueles acima de mim.",
                "Independência. Devo provar que posso me cuidar sem os mimos de minha família.",
                "Poder. Se eu puder alcançar mais poder, ninguém vai me dizer o que fazer."
            ],
            bonds: [
                "Vou enfrentar qualquer desafio para ganhar a aprovação de minha família.",
                "A aliança de minha casa com outra família nobre deve ser mantida a todo custo.",
                "Nada é mais importante que os outros membros de minha família.",
                "Estou apaixonado pelo herdeiro de uma família que minha família despreza."
            ],
            flaws: [
                "Eu secretamente acredito que todos estão abaixo de mim.",
                "Eu escondo um segredo verdadeiramente escandaloso que poderia arruinar minha família para sempre.",
                "Muitas vezes ouço insultos e ameaças veladas em cada palavra dirigida a mim.",
                "Eu tenho um desejo insaciável por prazeres carnais."
            ]
        }
    },
    {
        name: "Sábio",
        skillProficiencies: ["arcana", "history"],
        languages: 2,
        equipment: [
            "Frasco de tinta preta",
            "Pena",
            "Faca pequena",
            "Carta de um colega morto",
            "Roupas comuns",
            "Bolsa com 10 gp"
        ],
        feature: {
            name: "Pesquisador",
            description: "Quando você tenta aprender ou recordar um pedaço de conhecimento, se você não souber essa informação, você frequentemente sabe onde e de quem pode obtê-la. Geralmente, essa informação vem de uma biblioteca, scriptorium, universidade ou um sábio."
        },
        suggestedCharacteristics: {
            personalityTraits: [
                "Eu uso palavras polissilábicas que transmitem a impressão de grande erudição.",
                "Eu li todos os livros nas maiores bibliotecas do mundo.",
                "Estou acostumado a ajudar aqueles que não são tão inteligentes quanto eu.",
                "Não há nada que eu goste mais do que um bom mistério."
            ],
            ideals: [
                "Conhecimento. O caminho para o poder e a auto-melhoria é através do conhecimento.",
                "Beleza. O que é belo nos aponta além de nós mesmos para o que é verdadeiro.",
                "Lógica. Emoções não devem nublar nosso pensamento lógico.",
                "Sem Limites. Nada deve conter a possibilidade infinita inerente a toda existência."
            ],
            bonds: [
                "É meu dever proteger meus estudantes.",
                "Eu tenho um texto antigo que contém terríveis segredos que não devem cair em mãos erradas.",
                "Eu trabalho para preservar uma biblioteca, universidade, scriptorium ou mosteiro.",
                "O trabalho de minha vida é uma série de tomos relacionados a um campo específico de conhecimento."
            ],
            flaws: [
                "Eu me distraio facilmente com a promessa de informação.",
                "A maioria das pessoas grita e corre quando veem um demônio, eu paro e tomo notas.",
                "Desbloquear um mistério antigo vale o preço de uma civilização.",
                "Eu prefiro soluções óbvias a complicadas."
            ]
        }
    },
    {
        name: "Soldado",
        skillProficiencies: ["athletics", "intimidation"],
        toolProficiencies: ["Um tipo de kit de jogo", "Veículos (terrestres)"],
        equipment: [
            "Insígnia de posto",
            "Troféu de um inimigo caído",
            "Conjunto de dados de osso ou baralho de cartas",
            "Roupas comuns",
            "Bolsa com 10 gp"
        ],
        feature: {
            name: "Posto Militar",
            description: "Você tem um posto militar de sua carreira como soldado. Soldados leais à sua antiga organização militar ainda reconhecem sua autoridade e influência, e eles se submetem a você se forem de um posto inferior."
        },
        suggestedCharacteristics: {
            personalityTraits: [
                "Eu sou sempre educado e respeitoso.",
                "Eu sou assombrado por memórias de guerra. Não consigo tirar as imagens de violência da minha mente.",
                "Eu perdi muitos amigos, e sou lento para fazer novos.",
                "Eu sou cheio de histórias inspiradoras e cautelares de meu tempo militar."
            ],
            ideals: [
                "Bem Maior. Nosso destino é dar nossas vidas em defesa dos outros.",
                "Responsabilidade. Eu faço o que devo e obedeço à autoridade justa.",
                "Independência. Quando as pessoas seguem ordens cegamente, elas abraçam um tipo de tirania.",
                "Poder. Na vida como na guerra, o mais forte vence."
            ],
            bonds: [
                "Eu ainda daria minha vida pelas pessoas com quem servi.",
                "Alguém salvou minha vida no campo de batalha. Até hoje, nunca deixarei um amigo para trás.",
                "Minha honra é minha vida.",
                "Nunca esquecerei a esmagadora derrota que minha companhia sofreu."
            ],
            flaws: [
                "O inimigo monstruoso que enfrentamos em batalha ainda me deixa tremendo de medo.",
                "Eu tenho pouco respeito por quem não é um guerreiro comprovado.",
                "Eu cometi um erro terrível em batalha que custou muitas vidas.",
                "Meu ódio por meus inimigos é cego e irracional."
            ]
        }
    },
    {
        name: "Artesão de Guilda",
        skillProficiencies: ["insight", "persuasion"],
        toolProficiencies: ["Um tipo de ferramenta de artesão"],
        languages: 1,
        equipment: [
            "Um conjunto de ferramentas de artesão",
            "Carta de apresentação da guilda",
            "Roupas de viajante",
            "Bolsa com 15 gp"
        ],
        feature: {
            name: "Membro de Guilda",
            description: "Como membro estabelecido e respeitado de uma guilda, você pode contar com certos benefícios que a associação proporciona. Seus companheiros membros da guilda fornecerão alojamento e comida, se necessário, e pagarão pelo seu funeral se necessário."
        },
        suggestedCharacteristics: {
            personalityTraits: [
                "Eu acredito que qualquer coisa que valha a pena fazer vale a pena fazer direito.",
                "Eu sou um perfeccionista que trabalha incansavelmente para aperfeiçoar meu ofício.",
                "Eu sou rude com pessoas que não têm meu compromisso com o trabalho duro.",
                "Eu gosto de conversar longamente sobre minha profissão."
            ],
            ideals: [
                "Comunidade. É dever de todas as pessoas civilizadas fortalecer os laços da comunidade.",
                "Generosidade. Meus talentos foram dados a mim para que eu pudesse usá-los para beneficiar o mundo.",
                "Liberdade. Todos devem ser livres para perseguir seu próprio sustento.",
                "Ganância. Eu só faço isso pelo dinheiro."
            ],
            bonds: [
                "A oficina onde aprendi meu ofício é o lugar mais importante do mundo para mim.",
                "Eu criei algo importante junto com alguém querido para mim, e preciso proteger essa pessoa.",
                "Devo minha guilda uma grande dívida por me forjar na pessoa que sou hoje.",
                "Eu persigo riqueza para garantir o amor de alguém."
            ],
            flaws: [
                "Eu farei qualquer coisa para colocar as mãos em algo raro ou inestimável.",
                "Eu sou rápido em assumir que alguém está tentando me enganar.",
                "Ninguém deve saber que uma vez roubei dinheiro dos cofres da guilda.",
                "Eu nunca estou satisfeito com o que tenho - sempre quero mais."
            ]
        }
    },
    {
        name: "Artista",
        skillProficiencies: ["acrobatics", "performance"],
        toolProficiencies: ["Kit de disfarce", "Um tipo de instrumento musical"],
        equipment: [
            "Um instrumento musical",
            "O favor de um admirador",
            "Traje",
            "Bolsa com 15 gp"
        ],
        feature: {
            name: "Pela Demanda Popular",
            description: "Você sempre pode encontrar um lugar para se apresentar, geralmente em uma taverna ou estalagem, mas possivelmente com um circo, teatro ou até mesmo em uma corte nobre. Em tal lugar, você recebe alojamento e comida gratuitos."
        },
        suggestedCharacteristics: {
            personalityTraits: [
                "Eu conheço uma história relevante para quase todas as situações.",
                "Sempre que chego a um novo lugar, coleciono rumores locais e espalho fofocas.",
                "Eu sou um romântico incurável, sempre procurando por 'alguém especial'.",
                "Ninguém fica com raiva de mim ou ao meu redor por muito tempo."
            ],
            ideals: [
                "Beleza. Quando eu me apresento, faço o mundo melhor do que era.",
                "Tradição. As histórias, lendas e canções do passado nunca devem ser esquecidas.",
                "Criatividade. O mundo precisa de novas ideias e ação ousada.",
                "Ganância. Eu só faço isso pelo dinheiro e pela fama."
            ],
            bonds: [
                "Meu instrumento é minha posse mais preciosa.",
                "Alguém roubou meu precioso instrumento, e algum dia o recuperarei.",
                "Eu quero ser famoso, custe o que custar.",
                "Eu idolatro um herói das lendas antigas e meço meus feitos contra os dessa pessoa."
            ],
            flaws: [
                "Eu farei qualquer coisa para ganhar fama e renome.",
                "Eu sou um otário por um rosto bonito.",
                "Um escândalo me impede de voltar para casa. Esse tipo de problema parece me seguir por aí.",
                "Uma vez satirizei um nobre que ainda quer minha cabeça."
            ]
        }
    },
    {
        name: "Charlatão",
        skillProficiencies: ["deception", "sleightOfHand"],
        toolProficiencies: ["Kit de disfarce", "Kit de falsificação"],
        equipment: [
            "Roupas finas",
            "Kit de disfarce",
            "Ferramentas do golpe de sua escolha",
            "Bolsa com 15 gp"
        ],
        feature: {
            name: "Identidade Falsa",
            description: "Você criou uma segunda identidade que inclui documentação, conhecidos estabelecidos e disfarces que lhe permitem assumir essa persona. Além disso, você pode forjar documentos."
        },
        suggestedCharacteristics: {
            personalityTraits: [
                "Eu me apaixono e me desapaixono facilmente, e estou sempre perseguindo alguém.",
                "Eu tenho uma piada para cada ocasião, especialmente ocasiões onde o humor é inadequado.",
                "Bajular é minha arma preferida.",
                "Eu sou um jogador nato que não pode resistir a assumir um risco."
            ],
            ideals: [
                "Independência. Eu sou um espírito livre - ninguém me diz o que fazer.",
                "Justiça. Eu nunca viso pessoas que não podem se dar ao luxo de perder algumas moedas.",
                "Caridade. Eu distribuo o dinheiro que adquiro para as pessoas que realmente precisam.",
                "Criatividade. Eu nunca aplico o mesmo golpe duas vezes."
            ],
            bonds: [
                "Eu enganei a pessoa errada e devo trabalhar para garantir que essa pessoa nunca me cruze ou aqueles que me importo.",
                "Devo tudo ao meu mentor - uma pessoa horrível que provavelmente está apodrecendo na prisão em algum lugar.",
                "Em algum lugar por aí, tenho um filho que não me conhece. Estou fazendo o mundo melhor para ele ou ela.",
                "Eu venho de uma família nobre, e um dia vou recuperar minhas terras e título."
            ],
            flaws: [
                "Não consigo resistir a seduzir pessoas ricas e poderosas.",
                "Estou sempre endividado. Gasto meus ganhos ilícitos em luxos decadentes mais rápido do que os trago.",
                "Estou convencido de que ninguém poderia me enganar da maneira que engano os outros.",
                "Eu sou ganancioso demais para meu próprio bem."
            ]
        }
    },
    {
        name: "Eremita",
        skillProficiencies: ["medicine", "religion"],
        toolProficiencies: ["Kit de herbalismo"],
        languages: 1,
        equipment: [
            "Estojo de pergaminho cheio de notas",
            "Cobertor de inverno",
            "Roupas comuns",
            "Kit de herbalismo",
            "5 gp"
        ],
        feature: {
            name: "Descoberta",
            description: "A reclusão tranquila de sua estadia estendida lhe deu acesso a uma descoberta única e poderosa. A natureza exata dessa revelação depende da natureza de sua reclusão."
        },
        suggestedCharacteristics: {
            personalityTraits: [
                "Eu fui isolado por tanto tempo que raramente falo, preferindo gestos.",
                "Eu sou totalmente sereno, mesmo em face do desastre.",
                "O líder de minha comunidade tinha algo sábio a dizer sobre cada tópico.",
                "Eu me sinto tremendamente empático com todos que sofrem."
            ],
            ideals: [
                "Bem Maior. Meus dons são destinados a serem compartilhados com todos.",
                "Lógica. Emoções não devem nublar nosso senso do que é certo e verdadeiro.",
                "Pensamento Livre. A investigação e a curiosidade são os pilares do progresso.",
                "Poder. A solidão e a contemplação são caminhos para o poder místico ou mágico."
            ],
            bonds: [
                "Nada é mais importante que os outros membros de meu eremitério.",
                "Eu entrei em reclusão para me esconder daqueles que ainda podem estar me caçando.",
                "Eu ainda estou buscando a iluminação que persegui em minha reclusão.",
                "Eu entrei em reclusão porque amei alguém que não podia ter."
            ],
            flaws: [
                "Agora que voltei ao mundo, eu aprecio seus prazeres um pouco demais.",
                "Eu abomino a decadência da sociedade civilizada.",
                "Eu posso ser dogmático em meus pensamentos e filosofia.",
                "Eu deixo minha necessidade de ganhar argumentos ofuscar amizades e harmonia."
            ]
        }
    },
    {
        name: "Forasteiro",
        skillProficiencies: ["athletics", "survival"],
        toolProficiencies: ["Um tipo de instrumento musical"],
        languages: 1,
        equipment: [
            "Cajado",
            "Armadilha de caça",
            "Troféu de um animal que você matou",
            "Roupas de viajante",
            "Bolsa com 10 gp"
        ],
        feature: {
            name: "Andarilho",
            description: "Você tem uma memória excelente para mapas e geografia, e sempre pode recordar o layout geral de terreno, assentamentos e outras características ao redor. Além disso, você pode encontrar comida e água fresca para você e até cinco outras pessoas."
        },
        suggestedCharacteristics: {
            personalityTraits: [
                "Eu fui tocado pela natureza selvagem e me tornei mais selvagem.",
                "Eu não tenho tempo para amigos que não estão dispostos a fazer o que é necessário para sobreviver.",
                "Eu sou lento para confiar em membros de outras raças, tribos e sociedades.",
                "Eu tenho um grande apetite tanto por comida quanto por bebida."
            ],
            ideals: [
                "Mudança. A vida é como as estações, em constante mudança.",
                "Bem Maior. É responsabilidade de cada pessoa trazer a maior felicidade para toda a tribo.",
                "Honra. Se eu me desonrar, desonro todo meu clã.",
                "Poder. Os mais fortes são destinados a governar."
            ],
            bonds: [
                "Minha família, clã ou tribo é a coisa mais importante em minha vida.",
                "Uma lesão à natureza intocada de minha casa é uma lesão a mim.",
                "Eu traria terrível ira sobre os malfeitores que destruíram minha terra natal.",
                "Eu sou o último de meu povo, e é meu dever garantir que seus nomes entrem na lenda."
            ],
            flaws: [
                "Eu sou muito apaixonado por cerveja, vinho e outras bebidas.",
                "Não há espaço para cautela em uma vida vivida ao máximo.",
                "Eu me lembro de cada insulto que recebi e nutro um ressentimento silencioso.",
                "Eu sou lento para perdoar aqueles que me ofenderam."
            ]
        }
    },
    {
        name: "Marinheiro",
        skillProficiencies: ["athletics", "perception"],
        toolProficiencies: ["Ferramentas de navegador", "Veículos (aquáticos)"],
        equipment: [
            "Porrete",
            "50 pés de corda de cânhamo",
            "Amuleto da sorte",
            "Roupas comuns",
            "Bolsa com 10 gp"
        ],
        feature: {
            name: "Passagem de Navio",
            description: "Quando você precisar, pode garantir passagem gratuita em um navio de vela para você e seus companheiros de aventura. Você pode velejar no navio em que serviu, ou outro navio com o qual você tenha boas relações."
        },
        suggestedCharacteristics: {
            personalityTraits: [
                "Meus amigos sabem que podem confiar em mim, não importa o quê.",
                "Eu trabalho duro para que possa me divertir quando quiser.",
                "Eu gosto de velejar em novas terras e fazer novos amigos.",
                "Eu estico a verdade para o bem de uma boa história."
            ],
            ideals: [
                "Respeito. A coisa que mantém um navio unido é o respeito mútuo.",
                "Justiça. Todos fazemos o trabalho, então todos compartilhamos as recompensas.",
                "Liberdade. O mar é liberdade - a liberdade de ir a qualquer lugar.",
                "Domínio. Eu sou um predador, e os outros navios no mar são minha presa."
            ],
            bonds: [
                "Eu sou leal ao meu capitão primeiro, tudo o mais em segundo lugar.",
                "O navio é mais importante - tripulantes e capitães vêm e vão.",
                "Eu sempre me lembrarei de meu primeiro navio.",
                "Em uma cidade portuária, eu tenho um amante cujos olhos quase me roubaram do mar."
            ],
            flaws: [
                "Eu sigo ordens, mesmo que eu pense que estão erradas.",
                "Eu direi qualquer coisa para evitar ter que fazer trabalho extra.",
                "Uma vez que alguém questiona minha coragem, nunca recuo.",
                "Uma vez que eu começo a beber, é difícil para mim parar."
            ]
        }
    },
    {
        name: "Órfão",
        skillProficiencies: ["sleightOfHand", "stealth"],
        toolProficiencies: ["Kit de disfarce", "Kit de ladrão"],
        equipment: [
            "Faca pequena",
            "Mapa da cidade onde você cresceu",
            "Rato de estimação",
            "Pequeno token para lembrar seus pais",
            "Roupas comuns",
            "Bolsa com 10 gp"
        ],
        feature: {
            name: "Segredos da Cidade",
            description: "Você conhece os padrões secretos e fluxo das cidades e pode encontrar passagens através da expansão urbana que outros perderiam. Quando você não está em combate, você (e companheiros que você liderar) pode viajar entre dois locais na cidade duas vezes mais rápido."
        },
        suggestedCharacteristics: {
            personalityTraits: [
                "Eu escondo restos de comida e bugigangas em meus bolsos.",
                "Eu faço muitas perguntas.",
                "Eu gosto de me espremer em pequenos lugares onde ninguém mais pode me alcançar.",
                "Eu durmo com as costas para uma parede ou árvore, com tudo que possuo embrulhado em um pacote em meus braços."
            ],
            ideals: [
                "Respeito. Todas as pessoas, ricas ou pobres, merecem respeito.",
                "Comunidade. Temos que cuidar uns dos outros, porque ninguém mais vai fazer isso.",
                "Mudança. Os baixos são elevados, e os altos e poderosos são derrubados.",
                "Retribuição. Os ricos precisam mostrar mais generosidade aos pobres."
            ],
            bonds: [
                "Minha cidade ou vila é meu lar, e lutarei para defendê-la.",
                "Eu patrocino um orfanato para que outros não tenham que suportar o que eu fui forçado a suportar.",
                "Eu devo minha sobrevivência a outro órfão que me ensinou a viver nas ruas.",
                "Eu devo uma dívida que nunca poderei pagar a pessoa que teve pena de mim."
            ],
            flaws: [
                "Se eu estou em desvantagem, eu fugirei de uma luta.",
                "Ouro parece muito dinheiro para mim, e farei praticamente qualquer coisa por mais dele.",
                "Eu nunca confiarei totalmente em ninguém além de mim.",
                "Eu prefiro matar alguém em seu sono do que lutar de forma justa."
            ]
        }
    },
];

/**
 * Retorna um antecedente pelo nome
 */
export function getBackground(name: string): Background | undefined {
    return BACKGROUNDS.find(b => b.name === name);
}

/**
 * Retorna todos os nomes de antecedentes
 */
export function getBackgroundNames(): string[] {
    return BACKGROUNDS.map(b => b.name);
}
