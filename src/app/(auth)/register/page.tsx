'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from "@/app/components/auth/Button"
import { Input } from "@/app/components/auth/Input"
import { Label } from "@/app/components/auth/Label"
import { Card, CardContent, CardFooter, CardHeader } from "@/app/components/auth/Card"
import { showToast } from '@/app/components/Toast'

export default function Component() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const response = await fetch("http://localhost:3001/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: formData,
        },
      }),
    })

    if (response.ok) {
      const data = await response.json();
      console.log(data)
      // localStorage.setItem('auth_token', data);

      showToast('Cadastro realizado com sucesso!', 'success')
    } else {
      const errorData = await response.json()
      const errors = errorData?.errors || []
      const errorMessages = errors.length > 0
        ? errors.map((err: { title?: string }) => err.title || 'Erro desconhecido').join('\n')
        : 'Ocorreu um erro desconhecido.'
        
      showToast(`Ocorreu um erro: ${errorMessages}`, 'error')
    }

    console.log('Registration attempt with:', formData)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader style={{ padding: '48px' }} className="bg-primary text-white py-6">
          <h2 className="text-2xl font-bold text-center">IESB SAÚDE</h2>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    placeholder="Digite seu nome completo"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={handleChange}
                    required
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
              <div className="space-y-2">
                <Label htmlFor="passwordConfirmation">Confirmar Senha</Label>
                <Input
                  id="passwordConfirmation"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={formData.passwordConfirmation}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <Button className="w-full mt-6 bg-primary text-white hover:bg-red-700" type="submit">
              Cadastrar
            </Button>

            <div className="text-center text-sm mt-4">
              Já possui uma conta? {' '}
              <a href="/login" className="text-red-600 hover:underline">
                Faça Login!
              </a>
            </div>
          </form>
        </CardContent>
        <CardFooter className="bg-gray-50 p-4 flex flex-col space-y-2 rounded-b-lg">
          <div className="text-xs text-gray-600 text-center">
            Problemas com o acesso? Entre em contato com o suporte:
            <br />
            <a href="mailto:suporte@iesb.br" className="text-red-600 hover:underline">suporte@iesb.br</a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
