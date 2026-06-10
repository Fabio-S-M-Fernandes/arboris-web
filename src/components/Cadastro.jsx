import ArborisAuth from './ArborisAuth'
import HeaderAuth from './HeaderAuth'
import FooterAuth from './FooterAuth'

export default function Cadastro() {
  return (
    <>
      <HeaderAuth />
      <ArborisAuth defaultIsLogin={false} />
      <FooterAuth />
    </>
  )
}
