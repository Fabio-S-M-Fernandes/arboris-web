import ArborisAuth from './ArborisAuth'
import HeaderAuth from './HeaderAuth'
import FooterAuth from './FooterAuth'

export default function Login() {
  return (
    <>
      <HeaderAuth />
      <ArborisAuth defaultIsLogin={true} />
      <FooterAuth />
    </>
  )
}
