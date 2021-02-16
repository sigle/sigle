import styled from 'styled-components';
import tw from 'twin.macro';

const Title = styled.h1`
  color: red;
  font-size: 50px;
`;

export default function Home() {
  return (
    <>
      <Title>My page</Title>
      <div
        css={[
          tw`flex flex-col items-center justify-center h-screen`,
          tw`bg-gradient-to-b from-gray-300 to-red-400`,
        ]}
      >
        Yo
      </div>
    </>
  );
}
