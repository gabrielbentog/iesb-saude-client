"use client";
import { useState } from 'react';
import { Button } from "@/app/components/auth/Button";
import { Input } from "@/app/components/auth/Input";
import { Label } from "@/app/components/auth/Label";
import { Card, CardContent, CardFooter, CardHeader } from "@/app/components/auth/Card";
import { Eye, EyeOff } from 'lucide-react';
import { showToast } from '@/app/components/Toast';

interface LoginResponse {
  token: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem('user', JSON.stringify(data.data.attributes));
        showToast('Login efetuado com sucesso!', 'success');
      } else {

        const errorData = await response.json();
        const errors = errorData?.errors || [];
        const errorMessages = errors.length > 0
          ? errors.map((err: { title?: string }) => err.title || 'Erro desconhecido').join('\n')
          : 'Ocorreu um erro desconhecido.';

        showToast(`Ocorreu um erro! ${errorMessages}`, 'error');
      }
    } catch (err) {
      showToast('Erro ao processar a resposta!', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">

      <Card className="w-full max-w-md rounded-lg shadow-lg">
        <CardHeader className="bg-primary text-white p-10 flex flex-col items-center space-y-4 rounded-t-lg">
          <h2 className="text-2xl font-bold text-center">IESB SAÚDE</h2>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email / RA</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email ou RA"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md p-2 w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Digite sua senha'
                  required
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md p-2 w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-red-700 text-white py-2 rounded-md">
              Entrar
            </Button>

            <div className="text-center text-sm mt-4">
              Ainda não tem conta? {' '}
              <a href="/register" className="text-red-600 hover:underline">
                Cadastre-se aqui
              </a>
            </div>
          </form>
        </CardContent>
        <CardFooter className="bg-gray-50 p-4 flex flex-col space-y-2 rounded-b-lg">
          <a href="#" className="text-sm text-red-600 hover:underline text-center">
            Esqueceu sua senha?
          </a>
          <div className="text-xs text-gray-600 text-center">
            Problemas com o acesso? Entre em contato com o suporte:
            <br />
            <a href="mailto:suporte@iesb.br" className="text-red-600 hover:underline">suporte@iesb.br</a>
          </div>
        </CardFooter>
      </Card>
      <div className="mt-4 text-sm text-gray-600 space-x-4 text-center">
        <a href="#" className="hover:underline">Política de Privacidade</a>
        <a href="#" className="hover:underline">Termos de Uso</a>
        <a href="#" className="hover:underline">Sobre o IESB SAÚDE</a>
      </div>
    </div>
  );
}
