import React, { useState } from 'react';
import { StoryItem } from '../';
import { SubsetStory, BlockstackUser, StoryFile } from '../../../types';
import { DashboardLayout } from '../../layout/components/DashboardLayout';
import Image from 'next/legacy/image';
import { styled } from '../../../stitches.config';
import { Box, Button, Flex, Typography } from '../../../ui';
import {
  createNewEmptyStory,
  getStoriesFile,
  saveStoriesFile,
  saveStoryFile,
} from '../../../utils';
import { createSubsetStory } from '../../editor/utils';
import * as Fathom from 'fathom-client';
import { Goals } from '../../../utils/fathom';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

const sigleStories: StoryFile = {
  stories: [
    {
      id: 'erHSBQaLAEmrJXkR1SSbJ',
      title: 'Meet the Author: Grace Hye',
      content:
        'The "Meet the Author" interview series was created to share inspiring stories from independent writers and Web3 project founders who write on Sigle.\n\nFrom creating an NFT collection from scratch, to the pitfalls to avoid when starting a Web3 business, they give you their advice and opinions on the w...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/erHSBQaLAEmrJXkR1SSbJ/1669052370816-Grace_Hye.jpg',
      type: 'public',
      createdAt: 1668985200000,
      updatedAt: 1669283660768,
    },
    {
      id: 'J6juBmpCpKBS0sOJAc1iI',
      title: 'Hot From The Press #6',
      content:
        'Hot from the press: Sigle 1.5\n\nSigle x Xverse\n\nEver been frustrated not being able to check out new Sigle posts, or write your own, during long metro rides or in waiting rooms? Ever felt like there was nothing left to do but stare at the chipped off paint? Alright, this may be a little dramatic. But...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/J6juBmpCpKBS0sOJAc1iI/1667312991772-Twitter post - 28HFP_6.png',
      type: 'public',
      createdAt: 1667257200000,
      updatedAt: 1667312998603,
    },
    {
      id: 'h8Kxgg9_Ck6f0V-YgB7Gz',
      title: 'Pen Run #1: Writing contest!',
      content:
        'For our NFT collection The Explorer Guild’s 1 year anniversary, enter our very first storytelling contest and challenge your creativity! Ready? Set… Pen Run!\n\nThe rules!\n\n🎭 Theme\n\nWe kick off this first Pen Run with a very open theme!\n\nBased on the first chapter of the story of the Explorer Guild, ...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/h8Kxgg9_Ck6f0V-YgB7Gz/1666086010586-Pen Run_1.png',
      type: 'public',
      createdAt: 1666044000000,
      updatedAt: 1666086464680,
    },
    {
      id: 'LpPTqrNWvE3__yhKpEQVW',
      title: 'Hot From The Press #5',
      content:
        'Hot from the press: Sigle 1.4\n\nSigle is becoming more social\n\nA question we often get from our community is how to discover content on the platform. We are thrilled to announce that this is now possible!\n\nWith the new Explore page, you can discover writers on Sigle and read their content.\n\nAnother f...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/LpPTqrNWvE3__yhKpEQVW/1663676213441-Twitter post - 26HFP_5.png',
      type: 'public',
      createdAt: 1663538400000,
      updatedAt: 1663678764779,
    },
    {
      id: 'zAdbVlO9ZThIzw_y_LqMV',
      title: 'Sigle X Ceramic Network',
      content:
        'The beginning of a new chapter\n\nIn the following weeks, we will be exploring integrating Ceramic Network for Sigle. So what is Ceramic and why does this integration make sense for us?\n\n"Ceramic is a decentralised network for managing and processing mutable information. By combining IPFS, libp2p, blo...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/zAdbVlO9ZThIzw_y_LqMV/1660044978708-SiglexCeramic.png',
      type: 'public',
      createdAt: 1658440800000,
      updatedAt: 1660046326245,
      featured: true,
    },
    {
      id: 'CmpodFsrNpD7YOlk45TJ5',
      title: 'Hot From The Press #4',
      content:
        'Hot from the press: Sigle 1.3\n\nLast year, we became one of the first startups in the world to use NFTs to raise capital, via an NFT mint.\n\nA true adventurer ahead of his time, Jules Vernes inspired many French kids — including us — and so he would be the subject of our NFT collection. Our Explorer G...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/CmpodFsrNpD7YOlk45TJ5/1657630462107-Twitter post - 25HFP_4.png',
      type: 'public',
      createdAt: 1657490400000,
      updatedAt: 1657717639192,
      featured: false,
    },
    {
      id: 'mgQZnGiTHCcEkMC7Z9Ljb',
      title: 'Hot From The Press #3',
      content:
        'This is the newsletter for Sigle 1.2 release \n\nWell, warm off the press. This newsletter is well overdue: Sigle 1.2 was released one month ago.\n\nDark mode\n\nWe’re excited to introduce Dark Mode on Sigle! On a platform where you read and write, reducing eye strain in order to provide you with a better...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/mgQZnGiTHCcEkMC7Z9Ljb/1653908870304-Twitter post - 23HFP_3.png',
      type: 'public',
      createdAt: 1653861600000,
      updatedAt: 1653911445073,
    },
    {
      id: 'FRNv_3Lpup1CHZtGUDPOh',
      title: 'Burned Explorer Museum is open',
      content:
        'Access the museum\n\nFire wants to burn.\n\nA long time ago (in November), in a galaxy far far away (called the blockchain), the community (you) decided to burn 70% of the #1 Explorer Guild NFT collection. 7000 versions of the 19th Century French writer Jules Vernes would be lost for the good (hopefully...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/FRNv_3Lpup1CHZtGUDPOh/1647440347320-Burned_musseum_illu.png',
      type: 'public',
      featured: false,
      createdAt: 1647298800000,
      updatedAt: 1650972957798,
    },
    {
      id: 'JA9dBfdPDp7kQhkFkgPdv',
      title: 'New editor is in town',
      content:
        'It’s the first time we use the new editor to write a public blog post, and gosh are we excited! A new life has just begun for Sigle writers! Beta testing went very smoothly, so we decided to go ahead and release it. \n\nThere are loads of new features as well as general performance improvements that y...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/JA9dBfdPDp7kQhkFkgPdv/1646745138301-photo-1456324504439-367cee3b3c32.jpeg',
      type: 'public',
      createdAt: 1646690400000,
      updatedAt: 1646750625296,
      featured: false,
    },
    {
      id: 'zsoVIi3V6CE55-ygCdjVG',
      title: 'Introducing the new beta editor',
      content:
        'Goodbye old editor, hello new one.\n\nIntroducing the new Sigle editor in beta! Over and above previous improvements you already enjoy in our editor experience, this new editor has several exciting new features that will make your life easier, and your writing experience more fun. We will write a deta...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/zsoVIi3V6CE55-ygCdjVG/1646140182268-editor.png',
      type: 'public',
      createdAt: 1646131194738,
      updatedAt: 1653907035815,
    },
    {
      id: 'O8TCfyzU4RAEwzewAcDeR',
      title: 'Hot from the press #2',
      content:
        'It’s that time again! We are back with another set of exciting news. These past weeks have been full of new developments both for Sigle and also the Explorer Guild NFT project. Juggling between the two is no joke, so naturally, we have been spending time expanding the team.\n\nSigle is growing.\n\nWe re...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/O8TCfyzU4RAEwzewAcDeR/1643305614579-Twitter post - 11HFP_2.png',
      type: 'public',
      createdAt: 1643234400000,
      updatedAt: 1653904380512,
    },
    {
      id: 'jm4zEBtkaVtZKY9NPgdvy',
      title: 'Sigle is growing 🌱',
      content:
        '\n\nWithout further ado, we are very happy to publicly announce that Greg has joined our team as a frontend engineer and starting from today will be working together closely with everyone in the team to ensure the smoothest UI/UX out there.\nIt was apparent very early in the calls that Greg is an amazi...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/jm4zEBtkaVtZKY9NPgdvy/1641834812804-sushobhan-badhai-LrPKL7jOldI-unsplash.jpg',
      type: 'public',
      createdAt: 1641765600000,
      updatedAt: 1641835097124,
      featured: false,
    },
    {
      id: '9TI8oKZIO92Zr3F8u0dtE',
      title: 'Hot from the press #1',
      content:
        "This is the very first edition of Sigle “Hot one from the press” posts and we plan to publish them roughly every 2-3 weeks to keep all of you posted on what we are up to and what's next. Before we take off, big shoutout to Mark from Megapont who started the Newsletter trend in Stacks NFT space. It h...",
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/9TI8oKZIO92Zr3F8u0dtE/1643306033893-Twitter post - 11HFP_1.png',
      type: 'public',
      createdAt: 1639868400000,
      updatedAt: 1653904399642,
    },
    {
      id: 'q3UgkR4eZvsQPwK3yAeLV',
      title: 'The story of THE EXPLORER GUILD - Chapter 2',
      content:
        'Chapter II\n\nA strange sound hit the grey and electric sky. All the passers-by, including Jules Verne, turned around to observe the clouds.\n\n- “Oh, look, there!” shouted a businessman a few feet away. He pointed to a blue streak in the sky, like a shooting star that crashed to the ground several doze...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/q3UgkR4eZvsQPwK3yAeLV/1666085627825-Drawing-1.png',
      type: 'public',
      createdAt: 1638313200000,
      updatedAt: 1666085762578,
    },
    {
      id: 'BrdkUDZCvbbFoFHGx1DNu',
      title: 'Highway to hell',
      content:
        '\n\nFirstly, we really appreciate all of your support. For the team it means the world and we are determined to always stay in touch with the community. With few rather big decisions happening in a very short span of time, we always kept in mind the responsibility we have for you, our community. \nWe w...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/BrdkUDZCvbbFoFHGx1DNu/1637251206191-this-is-fine.1.jpg',
      type: 'public',
      createdAt: 1637186400000,
      updatedAt: 1637753518485,
    },
    {
      id: 'OSb5KPH8g1Ms-6vU7x1fe',
      title: 'Vote on-chain | The Explorer Guild',
      content:
        'The decision to stop Explorer minting was a tough one to make.\nWe have been extremely impressed and are super thankful to all of the community members who came forward with various concepts and ideas through the #community-ideas channel (on Discord) to find a solution to the problem we are facing wi...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/OSb5KPH8g1Ms-6vU7x1fe/1636991459258-vote_2.png',
      type: 'public',
      createdAt: 1636930800000,
      updatedAt: 1637052750822,
    },
    {
      id: 'BUilEpa1IX16uz9SlP0IT',
      title: 'Finding rarity',
      content:
        '\nRarity ranking\nWhen we released the explorers our mind was focused mostly on the unique combinations and narratives that can be built around each of the characters. While most certainly some attributes are rarer than others, the "looks" of each explorer is what we personally value the most and we t...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/BUilEpa1IX16uz9SlP0IT/1636651688086-Group_1.png',
      type: 'public',
      createdAt: 1636581600000,
      updatedAt: 1636655432862,
    },
    {
      id: 'At0ggeEe8kYn_SqbB6sVj',
      title: 'Halfway to the moon',
      content:
        "In the same way that Jules Verne aimed for the moon and ended up with 10k clones all over the place, our project didn't go exactly as planned. We are however very happy with how it all went, no little thanks to our awesome community (yes, you).\n\nIn just under a week, we are the 5th biggest project i...",
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/At0ggeEe8kYn_SqbB6sVj/1636146279617-announcement.png',
      type: 'public',
      createdAt: 1636066800000,
      updatedAt: 1636146400371,
    },
    {
      id: '9YaADPQyujrXa28aiNYzV',
      title: 'The story of THE EXPLORER GUILD - Chapter 1',
      content:
        'Chapter I\n\nIt was a mild autumn evening. The weather was grey and a light breeze caressed his face. Jules Verne sat on one of the benches in the botanical garden, facing the lake.\n\nIt was cold in Amiens in October 1895. The pigeons were clucking to keep warm and the ducklings were all out of the wat...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/9YaADPQyujrXa28aiNYzV/1635088374119-Drawing-1.png',
      type: 'public',
      createdAt: 1635026400000,
      updatedAt: 1666085583889,
    },
    {
      id: 'Jz70IvK4sTTv4Lh5gv_FO',
      title: 'Guide to becoming an EXPLORER',
      content:
        '\n\nTHE EXPLORER GUILD is going to be formed soon and before you join there are certain steps that you will need to complete. Similarly to when going on a long and exciting trip, there are some things that need to be taken care of before the light in the home is switched off for the final time before ...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/Jz70IvK4sTTv4Lh5gv_FO/1634662786028-twitter_share.png',
      type: 'public',
      createdAt: 1634590800000,
      updatedAt: 1634675674051,
    },
    {
      id: 'BiaQMSb-STMy6UHszuARA',
      title: 'THE EXPLORER GUILD - 10 000 NFT COLLECTION',
      content:
        '\n\nWriting is an exploration of what happens when we make a decision to open up our inner thoughts and ideas to the outside world. Any written piece makes a journey from somewhere within our minds to paper or nowadays more often to beautifully converted 0s and 1s on our screens. Making each and every...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/BiaQMSb-STMy6UHszuARA/1633962965986-Drawing-1.png',
      type: 'public',
      createdAt: 1633899600000,
      updatedAt: 1633965790645,
    },
    {
      id: '7cEFi3cNqBgE7AttSd-3r',
      title: "codex.btc : Let's talk about Clarity",
      content:
        "\n\nPhoto credit : birgerstrahl\n\nLet's talk about Clarity, the language that brings smart contracts to Bitcoin.\nI will cover the design decisions behind Clarity, and some of the features of Clarity that makes it different from other smart contract languages.\n\nMeet Clarity\nClarity is built by @hirosyst...",
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/7cEFi3cNqBgE7AttSd-3r/1633772424228-birger-strahl-Zn0OvfhhDQ4-unsplash.jpg',
      type: 'public',
      createdAt: 1633726800000,
      updatedAt: 1633773156871,
    },
    {
      id: 'tndCtc35W6hsFpVXubPuO',
      title: 'Muneeb Ali: $30M+ in BTC rewards paid out',
      content:
        '\n\nPhoto credit :  executim \n$30M+ in BTC rewards to folks since the Stacks mainnet launch this year.\nWhat factors determine the reward rate?\nStacks has a unique consensus where instead of burning electricity, miners bid in BTC. Bitcoin is used as digital energy for mining. The BTC is recycled and se...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/tndCtc35W6hsFpVXubPuO/1633526546002-executium--5z36YztTtM-unsplash.jpg',
      type: 'public',
      createdAt: 1633467600000,
      updatedAt: 1633526731754,
    },
    {
      id: '8ljPEmYw2LNJlHgobAcV6',
      title: 'Jude Nelson: App Chains',
      content:
        "\nImage credit : axopoa\n\nBlockchains don't scale. The fact that all nodes process all transactions means that the blockchain only goes as fast as the slowest node allowed on the network. If that's something like a Raspberry Pi, then that's as fast as the blockchain goes.\nAnd that's okay! The upside i...",
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/8ljPEmYw2LNJlHgobAcV6/1632824911111-FAW1DIFXsAAUahh.png',
      type: 'public',
      createdAt: 1632776400000,
      updatedAt: 1632825635159,
    },
    {
      id: 'dI2wr-MwTGoleOO4Ngmuc',
      title: 'From 0 to Sigle: The vision',
      content:
        'Sigle started as a side project created by 2 "buidlers" and we didn\'t know where it would lead us.\nAt that time (in 2019), decentralised blogging was not yet a thing and there were no good 3.0 platforms to enjoy writing pseudonymously on a daily basis.\nOur goal was to provide a way for users to easi...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/dI2wr-MwTGoleOO4Ngmuc/1632213957719-The_Vision.png',
      type: 'public',
      createdAt: 1632175200000,
      updatedAt: 1632213979723,
      featured: false,
    },
    {
      id: 'WMgy0PXnU1QP_2wYh69_J',
      title: 'Ryan Hoover: Why I Never Change My Profile Pic',
      content:
        'This is my avatar:\n\nI’ve used this photo on Twitter and other services for the past five years and have no intention of changing it despite my increasing age (I just turned 27).\nI often see people change their profile picture on a regular basis. For those trying to build an online identity, this is ...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/WMgy0PXnU1QP_2wYh69_J/1631878288248-5f79f1279f88ca0a29dec588_1_CSVPkoqiXznSGE1zmyghjQ.jpg',
      type: 'public',
      createdAt: 1631829600000,
      updatedAt: 1631891425145,
    },
    {
      id: 'sbsLInYVMbpCGvyTZPjwk',
      title: 'Introducing STX stats 👀',
      content:
        "The Stacks ecosystem is growing and it's not just the price or speculative value. A lot is happening: there are 25 really talented teams of builders within the Stacks Accelerator, there is the dot BTC domain, there is Miami CityCoin, Dan Held is writing about it to his 300k Twitter followers… just t...",
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/sbsLInYVMbpCGvyTZPjwk/1625239345113-Twitter post - 1.png',
      type: 'public',
      createdAt: 1625184000000,
      updatedAt: 1631953599446,
    },
    {
      id: 'v325npRULzygGb9kDT6Cg',
      title: 'Sigle joins Stacks accelerator 🚀',
      content:
        'Sigle started 2 years ago as a side project, when we decided to create it we never imagined that one day we would have such news to share.\nToday, we are thrilled to announce that we are part of the first stacks cohort with 24 other amazing projects! Stacks accelerator is providing us with resources ...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/v325npRULzygGb9kDT6Cg/1624794551411-stack_ac.jpg',
      type: 'public',
      featured: false,
      createdAt: 1623369600000,
      updatedAt: 1624795006710,
    },
    {
      id: 'koGSiUaZGcpznRj-qdL6C',
      title: '2021: Time for big resolutions',
      content:
        'Happy new year! 🥳\nWhat a year, friends!\nThere is a lot to say. This has been a great year for us and many of you have joined us on Sigle.\nFirst of all, we would like to thank you for joining the adventure and for your involvement.\nBefore talking about this new year and what’s coming up, let’s take ...',
      coverImage:
        'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/koGSiUaZGcpznRj-qdL6C/1610732633332-2021.jpg',
      type: 'public',
      createdAt: 1610668800000,
      updatedAt: 1610733263461,
      featured: false,
    },
    {
      id: 'Qk5y5A0yvSXOwIbB6SlMc',
      title: 'Introducing Meta Data',
      content:
        'We heard you… writing stories is cool, but having the opportunity to share your writings with your community is even cooler.\nThat’s why we worked on meta data, allowing you to get fancy share boxes on social media and having the possibility of adding your own meta title and description.\nFrom today, ...',
      coverImage: 'https://i.goopics.net/9OW4l.jpg',
      type: 'public',
      createdAt: 1572998400000,
      updatedAt: 1573580912255,
    },
    {
      id: '0jE9PPqbxU6ptWNxl0Wi-',
      title: 'Style guide: Text & page editor',
      content:
        'This guide provides you with everything you need to know about the text editor and page styles. It may change, depending on the added themes or possible updates.\nImages\nStory cover picture\nYou can add a cover picture to any stories.\nBy clicking on the wheel next to the save button on the "Edit" page...',
      coverImage: 'https://i.goopics.net/ay3Je.jpg',
      type: 'public',
      createdAt: 1550064480473,
      updatedAt: 1550172773681,
    },
    {
      id: 'L7I4iV6bYQ8WYvuT3RcoM',
      title: 'Sigle.io: Step by step guide 🤓',
      content:
        'This content was created on app.sigle.io\n\nIn just a few words, Sigle is the perfect tool for writers/bloggers to easily create decentralized content and take notes.\nThat means no one but you owns your data and published work. It is safe from any censorship and you maintain your privacy and freedom.\n...',
      coverImage: 'https://i.goopics.net/Vby3Z.jpg',
      type: 'public',
      createdAt: 1549407600000,
      updatedAt: 1651220239160,
    },
  ],
};

const ImgWrapper = styled('div', {
  position: 'relative',
  mx: 'auto',
});

const StoryCardSkeleton = () => {
  return (
    <Flex
      css={{
        display: 'none',

        '@lg': {
          display: 'flex',
          gap: '$7',
          p: '$7',
        },
      }}
    >
      <Box
        css={{ width: 180, height: 130, backgroundColor: '$gray2', br: '$1' }}
      />
      <Flex direction="column" justify="between">
        <Flex direction="column" gap="2">
          <Box
            css={{
              width: 350,
              height: 20,
              backgroundColor: '$gray2',
              br: '$1',
            }}
          />
          <Box
            css={{
              width: 150,
              height: 20,
              backgroundColor: '$gray2',
              br: '$1',
            }}
          />
        </Flex>
        <Flex direction="column" gap="2">
          <Box
            css={{
              width: 600,
              height: 20,
              backgroundColor: '$gray2',
              br: '$1',
            }}
          />
          <Box
            css={{
              width: 500,
              height: 20,
              backgroundColor: '$gray2',
              br: '$1',
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

interface Props {
  selectedTab: 'published' | 'drafts';
  user: BlockstackUser;
  stories: SubsetStory[] | null;
  loading: boolean;
  refetchStoriesLists: () => Promise<void>;
}

export const Home = ({
  selectedTab,
  user,
  stories,
  loading,
  refetchStoriesLists,
}: Props) => {
  const [loadingCreate, setLoadingCreate] = useState(false);
  const router = useRouter();

  const showIllu = !loading && (!stories || stories.length === 0);
  const nbStoriesLabel = loading ? '...' : stories ? stories.length : 0;

  const handleCreateNewPrivateStory = async () => {
    setLoadingCreate(true);
    try {
      const storiesFile =
        user.username === 'sigle.btc' ? sigleStories : await getStoriesFile();
      const story = createNewEmptyStory();

      storiesFile.stories.unshift(
        createSubsetStory(story, { plainContent: '' })
      );

      await saveStoriesFile(storiesFile);
      await saveStoryFile(story);

      Fathom.trackGoal(Goals.CREATE_NEW_STORY, 0);
      router.push('/stories/[storyId]', `/stories/${story.id}`);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setLoadingCreate(false);
    }
  };

  return (
    <DashboardLayout>
      <Typography
        size="h4"
        css={{
          fontWeight: 600,
          pb: '$5',
          mb: '$2',
          borderBottom: '1px solid $colors$gray6',
        }}
      >
        {selectedTab === 'published'
          ? `Published stories (${nbStoriesLabel})`
          : `Drafts stories (${nbStoriesLabel})`}
      </Typography>
      {showIllu && (
        <Flex css={{ mt: '$10' }} align="center" direction="column">
          {selectedTab === 'drafts' && (
            <ImgWrapper>
              <Image
                width={250}
                height={94}
                src="/static/img/zero_data.gif"
                objectFit="cover"
              />
            </ImgWrapper>
          )}
          <Typography
            size="subheading"
            css={{ mt: '$5', mb: '$3' }}
          >{`You currently have no ${
            selectedTab === 'published' ? 'published stories' : 'drafts'
          }`}</Typography>
          {selectedTab === 'drafts' && (
            <Button
              size="sm"
              variant="subtle"
              disabled={loadingCreate}
              onClick={handleCreateNewPrivateStory}
            >
              {!loadingCreate ? `Start writing` : `Creating new story...`}
            </Button>
          )}
          <StoryCardSkeleton />
          <StoryCardSkeleton />
        </Flex>
      )}

      {stories &&
        stories.map((story) => (
          <StoryItem
            key={story.id}
            user={user}
            story={story}
            type={selectedTab === 'published' ? 'public' : 'private'}
            refetchStoriesLists={refetchStoriesLists}
          />
        ))}
    </DashboardLayout>
  );
};
