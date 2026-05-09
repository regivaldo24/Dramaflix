import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

export default function QAPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 mb-0 border-b border-neutral-800 sticky top-0 bg-[#0a0a0a] z-10">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1 -ml-1 hover:bg-white/10 rounded-full transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-bold absolute left-1/2 -translate-x-1/2 tracking-wide">
          Q&A
        </h1>
        <div className="w-6"></div>
      </div>

      <div className="overflow-y-auto pb-20 bg-[#121212]">
        {/* Section 1 */}
        <div className="bg-[#424242] px-4 py-3 border-y border-[#3a3a3c]">
          <h2 className="text-[14px] font-bold text-white tracking-widest uppercase">
            Problemas com pagamento e moedas
          </h2>
        </div>
        <div className="bg-[#1c1c1e]">
          <QAItem 
            text="Paguei dinheiro, mas não recebi moedas" 
            answer={
              <div className="text-sm text-neutral-300 space-y-2 mt-1">
                <p>Verifique seu registro de recarga e restaure suas informações de recarga.</p>
                <p>Siga as etapas: perfil {'>'} carteira {'>'} recarga {'>'} restaurar.</p>
                <p>Se ainda assim não funcionar, acesse sua conta de pagamento e entre em contato conosco com o número do seu pedido.</p>
                <ul className="list-disc pl-5 text-neutral-400">
                  <li>Google Play Store</li>
                  <li>Pagamentos e assinaturas</li>
                  <li>Orçamentos e histórico</li>
                </ul>
              </div>
            }
          />
          <QAItem 
            text="Não consigo concluir o pagamento" 
            answer={
              <div className="text-sm text-neutral-300 space-y-2 mt-1">
                <ul className="list-disc pl-5 text-neutral-400 space-y-1">
                  <li>Se uma mensagem de erro de pagamento for exibida, verifique se a rede está funcionando corretamente.</li>
                  <li>Você pode tentar mudar seu ambiente de rede, como usar uma rede diferente.</li>
                  <li>Se o método acima não resolver seu problema, envie-nos uma captura de tela da página e informe-nos sobre o problema.</li>
                </ul>
              </div>
            }
          />
          <QAItem 
            text="E se eu não conseguir encontrar um método de pagamento adequado?" 
            answer={
              <div className="text-sm text-neutral-300 space-y-2 mt-1">
                <p>Devido às políticas do Google Play, oferecemos apenas o Google Play no aplicativo.</p>
              </div>
            }
          />
          <QAItem 
            text="Posso solicitar um reembolso?" 
            hideBorder 
            answer={
              <div className="text-sm text-neutral-300 space-y-2 mt-1">
                <p>Desculpe, qualquer pagamento que você tenha feito para nós não é reembolsável. As moedas podem ser usadas para desbloquear capítulos pagos.</p>
              </div>
            }
          />
        </div>

        {/* Section 2 */}
        <div className="bg-[#424242] px-4 py-3 border-y border-[#3a3a3c]">
          <h2 className="text-[14px] font-bold text-white tracking-widest uppercase">
            Moedas e bônus
          </h2>
        </div>
        <div className="bg-[#1c1c1e]">
          <QAItem 
            text="Minhas moedas ou bônus foram perdidos ou reduzidos" 
            answer={
              <div className="text-sm text-neutral-300 space-y-3 mt-1">
                <p>Você pode ter feito login em uma conta diferente. Verifique seu histórico. Siga as etapas abaixo:</p>
                <div className="space-y-1">
                  <p className="font-semibold text-neutral-200">Histórico de recarga:</p>
                  <p className="pl-3 text-neutral-400">Perfil {'>'} Carteira {'>'} Detalhes {'>'} Histórico de transações</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-neutral-200">Bônus:</p>
                  <p className="pl-3 text-neutral-400">Perfil {'>'} Carteira {'>'} Detalhes {'>'} Bônus {'>'} Data de validade</p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-neutral-200">Registro de despesas:</p>
                  <p className="pl-3 text-neutral-400">Perfil {'>'} Carteira {'>'} Detalhes {'>'} Registro de despesas</p>
                </div>
                <p>Você pode fazer login na versão atual do Dramaflix usando uma conta Google. Se você não fizer login, seu dispositivo receberá uma conta de visitante. Você pode ver sua conta na página de perfil.</p>
                <p>Se o seu apelido for "Visitante", trata-se de um ID de visitante. Quando você usa um novo celular, uma nova conta de visitante é gerada. O histórico anterior e o saldo da conta desaparecerão.</p>
                <p>Se o seu bônus diminuiu, você pode verificar seu histórico pois alguns bônus podem ter expirado (Perfil {'>'} Carteira {'>'} Detalhes {'>'} Bônus {'>'} Data de validade).</p>
                <p>Se nenhum dos métodos acima resolver o seu problema, envie-nos uma captura de tela da página onde você está enfrentando o problema.</p>
              </div>
            }
          />
          <QAItem 
            text="Qual é a diferença entre moedas e bônus?" 
            answer={
              <div className="text-sm text-neutral-300 space-y-2 mt-1">
                <ul className="list-disc pl-5 text-neutral-400 space-y-1">
                  <li>Livros, moedas e itens obtidos através de compra podem ser desbloqueados.</li>
                  <li>As moedas são sempre válidas.</li>
                  <li>Moedas de bônus podem ser obtidas através de:
                    <ul className="list-[circle] pl-5 mt-1 space-y-0.5">
                      <li>Assinaturas</li>
                      <li>Eventos</li>
                      <li>Compartilhamento</li>
                      <li>Compra de moedas</li>
                    </ul>
                  </li>
                  <li>O bônus é válido por um período de tempo limitado e tem uma data de validade.</li>
                  <li>O bônus pode ser encontrado nas seções: perfil, carteira, detalhes, junto com o valor do bônus e a data de validade.</li>
                </ul>
              </div>
            }
          />
          <QAItem 
            text="Como comprar moedas" 
            answer={
              <div className="text-sm text-neutral-300 space-y-2 mt-1">
                <p>Selecione o pacote desejado em Perfil {'>'} Minha carteira {'>'} Recargas.</p>
                <p>Em seguida, envie e pague.</p>
                <p>Após o pedido ser concluído, as moedas serão emitidas automaticamente em sua carteira.</p>
              </div>
            }
          />
          <QAItem 
            text="As moedas e os bônus serão devolvidos junto com o reembolso da assinatura?" 
            hideBorder 
            answer={
              <div className="text-sm text-neutral-300 space-y-2 mt-1">
                <p>As moedas e bônus recebidos da assinatura serão retirados após o recebimento do reembolso da assinatura.</p>
              </div>
            }
          />
        </div>

        {/* Section 3 */}
        <div className="bg-[#424242] px-4 py-3 border-y border-[#3a3a3c]">
          <h2 className="text-[16px] font-bold text-white tracking-wide">
            Assinatura
          </h2>
        </div>
        <div className="bg-[#1c1c1e]">
          <QAItem 
            text="Não consigo encontrar a maneira de cancelar a renovação" 
            hideBorder 
            answer={
              <div className="text-sm text-neutral-300 space-y-2 mt-1">
                <p>Se você assinar pelo aplicativo, poderá acessar a App Store, sua conta de assinatura ou o Google Play para cancelar a renovação.</p>
                <p>Se você assinar pelo site, acesse www.dramasflix.com.br faça login e vá para sua conta. Para cancelar a renovação, acesse sua conta.</p>
                <p>Você precisa cancelar a renovação pelo menos 24 horas antes do final do prazo da assinatura atual.</p>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}

function QAItem({ text, hideBorder, answer }: { text: string; hideBorder?: boolean; answer?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={`px-4 py-4 ${!hideBorder ? "border-b border-[#2c2c2e]" : ""} ${answer ? "cursor-pointer" : ""}`}
      onClick={() => answer && setIsOpen(!isOpen)}
    >
      <div className="flex gap-3 items-start">
        <span className="text-white text-lg leading-none mt-0.5">•</span>
        <span className="text-[15px] font-medium text-white flex-1">{text}</span>
      </div>
      {isOpen && answer && (
        <div className="mt-3 ml-4 pl-3 border-l-2 border-neutral-700/50">
          {answer}
        </div>
      )}
    </div>
  );
}
