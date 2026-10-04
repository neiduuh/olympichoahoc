(function(){
  'use strict';
  if (!window.Phaser) {
    window.ChemGames = { ready:false, error:'Phaser.js chưa tải được.' };
    return;
  }

  const Phaser = window.Phaser;
  const W = 960, H = 500;
  const C = {
    navy: 0x081b2b, navy2: 0x0d2d45, white: 0xf7fbff, ink: 0x142533,
    cyan: 0x58d6ff, sky: 0x78d7ff, grass: 0x58b957, grass2: 0x2f7e45,
    yellow: 0xffd43b, amber: 0xffa928, orange: 0xf47b20, red: 0xe44c58,
    blue: 0x2d75d8, green: 0x29b66f, teal: 0x26c6a2, purple: 0x7559d9,
    gray: 0x5a6976, lightGray: 0xdbe5ec, darkGray: 0x2d3339, road: 0x353b42,
    wood: 0x9b6138, honey: 0xf4ad1a
  };

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const labelStyle=(size=24,color='#ffffff',weight='700')=>({
    fontFamily:'Arial, sans-serif', fontSize:`${size}px`, fontStyle:weight==='700'?'bold':'normal',
    color, stroke:'#06131d', strokeThickness:size>=28?5:3, align:'center'
  });

  class MainScene extends Phaser.Scene {
    constructor(){ super('Main'); this.mode=null; this.refs={}; this.onDirection=null; }
    preload(){
      const assets=window.CHEM_ASSETS||window.ChemAssets||{};
      if(assets.basketballScene && !this.textures.exists('basketScene')) this.load.image('basketScene', assets.basketballScene);
      if(assets.raceRockScene && !this.textures.exists('raceRockScene')) this.load.image('raceRockScene', assets.raceRockScene);
      if(assets.racePuddleScene && !this.textures.exists('racePuddleScene')) this.load.image('racePuddleScene', assets.racePuddleScene);
      if(assets.raceBushScene && !this.textures.exists('raceBushScene')) this.load.image('raceBushScene', assets.raceBushScene);
    }
    create(){
      this.cameras.main.setBackgroundColor('#071a28');
      this.makeTextures();
      this.drawLoading();
      this.game.events.emit('chem-ready');
    }
    clearScene(){
      this.tweens.killAll();
      this.time.removeAllEvents();
      this.children.removeAll(true);
      this.refs={}; this.onDirection=null;
      this.cameras.main.setZoom(1); this.cameras.main.setScroll(0,0); this.cameras.main.setRotation(0);
    }
    drawLoading(){
      this.clearScene();
      this.add.rectangle(W/2,H/2,W,H,C.navy);
      this.add.text(W/2,H/2-8,'OLYMPIC HÓA HỌC',labelStyle(36,'#ffd43b')).setOrigin(.5);
      this.add.text(W/2,H/2+44,'Sẵn sàng cho thử thách',labelStyle(19,'#d7ebf7','400')).setOrigin(.5);
    }
    makeTextures(){
      if(this.textures.exists('beeTex')) return;
      let g=this.make.graphics({x:0,y:0,add:false});
      // Bee
      g.fillStyle(0xffffff,.72); g.fillEllipse(25,22,34,22); g.fillEllipse(60,22,34,22);
      g.lineStyle(3,0xd8edf5,.9); g.strokeEllipse(25,22,34,22); g.strokeEllipse(60,22,34,22);
      g.fillStyle(C.yellow,1); g.fillEllipse(45,42,58,39); g.lineStyle(3,0x17222b,1); g.strokeEllipse(45,42,58,39);
      g.fillStyle(0x17222b,1); g.fillRect(35,25,8,33); g.fillRect(51,25,8,33);
      g.fillStyle(C.yellow,1); g.fillCircle(72,39,20); g.lineStyle(3,0x17222b,1); g.strokeCircle(72,39,20);
      g.fillStyle(0x17222b,1); g.fillCircle(78,34,3); g.fillCircle(84,42,2);
      g.lineStyle(3,0x17222b,1); g.beginPath();g.moveTo(69,22);g.lineTo(62,8);g.moveTo(78,21);g.lineTo(86,8);g.strokePath();
      g.generateTexture('beeTex',96,76); g.clear();
      // Treasure miner (single texture avoids container-position issues)
      g.fillStyle(0x000000,.18); g.fillEllipse(34,70,48,10);
      g.fillStyle(0xf2b48b,1); g.fillCircle(34,25,15); g.lineStyle(2,0x6f3a21,1); g.strokeCircle(34,25,15);
      g.fillStyle(0xf2c338,1); g.fillRoundedRect(17,8,34,10,5); g.fillCircle(34,10,15); g.lineStyle(2,0x8b5a12,1); g.strokeCircle(34,10,15);
      g.fillStyle(0xf8fbff,1); g.fillCircle(34,9,6); g.fillStyle(0x55d2ff,1); g.fillCircle(34,9,3);
      g.fillStyle(0x1d2630,1); g.fillCircle(29,24,2); g.fillCircle(39,24,2); g.lineStyle(2,0x8f4a33,1); g.beginPath(); g.moveTo(29,31); g.lineTo(34,34); g.lineTo(39,31); g.strokePath();
      g.fillStyle(0x2e86c9,1); g.fillRoundedRect(19,39,30,25,6); g.fillStyle(0xf0b138,1); g.fillRect(31,39,6,25);
      g.fillStyle(0x5f3b27,1); g.fillRect(20,61,10,8); g.fillRect(39,61,10,8);
      g.lineStyle(4,0x6f5036,1); g.beginPath(); g.moveTo(51,45); g.lineTo(61,27); g.strokePath(); g.lineStyle(3,0xb8c2c9,1); g.beginPath(); g.moveTo(54,28); g.lineTo(68,22); g.strokePath();
      g.generateTexture('minerTex',72,78); g.clear();
      // Soccer ball
      g.fillStyle(0xffffff,1); g.fillCircle(32,32,28); g.lineStyle(3,0x1a242c,1); g.strokeCircle(32,32,28);
      g.fillStyle(0x192126,1); g.fillCircle(32,31,8); [0,72,144,216,288].forEach(a=>{const r=18,rad=Phaser.Math.DegToRad(a);g.fillCircle(32+Math.cos(rad)*r,32+Math.sin(rad)*r,5)});
      g.generateTexture('soccerBall',64,64); g.clear();
      // Basketball
      g.fillStyle(0xf28b25,1); g.fillCircle(32,32,29); g.lineStyle(3,0x3b2a1d,1); g.strokeCircle(32,32,29); g.lineStyle(3,0x3b2a1d,1);
      g.beginPath();g.moveTo(4,32);g.lineTo(60,32);g.moveTo(32,3);g.lineTo(32,61);g.strokePath();
      g.beginPath();g.arc(5,32,35,-.75,.75);g.strokePath();g.beginPath();g.arc(59,32,35,2.39,3.89);g.strokePath();
      g.generateTexture('basketBall',64,64);g.clear();
      // Coin/star sparkle
      g.fillStyle(C.yellow,1); const pts=[]; for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?5:11;pts.push(new Phaser.Geom.Point(12+Math.cos(a)*r,12+Math.sin(a)*r));}
      g.fillPoints(pts,true); g.generateTexture('spark',24,24);g.destroy();
    }
    addSky(top=0x70d5ff,bottom=0xc8f1ff){
      const bands=18, bh=H*0.64/bands;
      const g=this.add.graphics();
      const tr=Phaser.Display.Color.IntegerToColor(top), br=Phaser.Display.Color.IntegerToColor(bottom);
      for(let i=0;i<bands;i++){
        const c=Phaser.Display.Color.Interpolate.ColorWithColor(tr,br,bands-1,i);
        g.fillStyle(Phaser.Display.Color.GetColor(c.r,c.g,c.b),1); g.fillRect(0,i*bh,W,bh+1);
      }
      this.add.circle(805,78,44,0xffe66d,.95);
      for(let i=0;i<5;i++){
        const x=120+i*185,y=58+(i%2)*42; const cloud=this.add.container(x,y).setAlpha(.72);
        cloud.add([this.add.circle(0,8,22,0xffffff),this.add.circle(24,0,28,0xffffff),this.add.circle(52,10,20,0xffffff),this.add.rectangle(25,14,76,28,0xffffff)]);
      }
    }
    drawHills(){
      const g=this.add.graphics();
      g.fillStyle(0x8fc66e,1); g.fillTriangle(0,330,215,130,430,330); g.fillTriangle(255,330,520,110,760,330); g.fillTriangle(600,330,810,155,1020,330);
      g.fillStyle(0x6aa259,1); g.fillTriangle(-70,340,120,180,320,340); g.fillTriangle(460,340,700,155,980,340);
      g.fillStyle(0xffffff,.82); g.fillTriangle(152,190,215,130,278,190);g.fillTriangle(458,177,520,110,588,185);g.fillTriangle(754,205,810,155,866,205);
    }
    addHeader(title, subtitle, accent=C.yellow){
      this.add.rectangle(24,20,420,66,0x061724,.78).setOrigin(0).setStrokeStyle(2,0xffffff,.12);
      this.add.rectangle(24,20,8,66,accent,1).setOrigin(0);
      this.add.text(50,31,title,{...labelStyle(25,'#ffffff'),strokeThickness:3}).setOrigin(0,0);
      this.add.text(50,61,subtitle,{fontFamily:'Arial',fontSize:'15px',color:'#c8dfed'}).setOrigin(0,0);
    }
    makeButton(x,y,label,dir,blocked,selected){
      const fill=blocked?0x5d6670:(selected?C.yellow:0x0d3854), txt=blocked?'×':label;
      const bg=this.add.rectangle(x,y,62,56,fill,.98).setStrokeStyle(3,blocked?0x85909a:0x77bddb,.95).setDepth(41);
      const t=this.add.text(x,y-2,txt,{...labelStyle(30,blocked?'#d8dde1':selected?'#142533':'#ffffff'),strokeThickness:0}).setOrigin(.5).setDepth(42);
      const obj={list:[bg,t],x,y,dir};
      if(!blocked){
        bg.setInteractive({useHandCursor:true});
        bg.on('pointerover',()=>{if(!this.refs.beeDirectionLocked){bg.setScale(1.08);t.setScale(1.08);}});
        bg.on('pointerout',()=>{bg.setScale(1);t.setScale(1);});
        bg.on('pointerdown',()=>{
          if(this.refs.beeDirectionLocked)return;
          this.selectDirection(dir);
          if(this.onDirection)this.onDirection(dir);
        });
      }
      return obj;
    }
    selectDirection(dir){
      this.refs.selectedDir=dir;
      ['up','down','left','right'].forEach(d=>{
        const obj=this.refs.dirButtons?.[d]; if(!obj)return;
        const bg=obj.list[0], txt=obj.list[1]; const blocked=this.refs.blocked?.includes(d);
        if(blocked)return;
        bg.setFillStyle(d===dir?C.yellow:0x0d3854,1); txt.setColor(d===dir?'#142533':'#ffffff');
      });
    }

    showTreasure(o={}){
      this.clearScene();
      this.mode='treasure';
      this.refs.treasureBusy=false;
      this.refs.onTreasureMove=o.onMove||null;

      const state=o.state||{};
      const routeDefs=[
        {id:'mountain',name:'ĐƯỜNG NÚI ĐÁ',icon:'⛰',color:0xe9ad49,ys:[154,126,158,128,164]},
        {id:'cave',name:'ĐƯỜNG HANG BÍ MẬT',icon:'◆',color:0x64b9de,ys:[254,232,266,236,258]},
        {id:'forest',name:'ĐƯỜNG RỪNG CỔ',icon:'♣',color:0x6fc46a,ys:[354,380,346,378,344]}
      ];
      const routeState=new Map((state.paths||[]).map(p=>[p.id,p]));
      const xs=[342,432,522,612,702];
      const start={x:250,y:254};
      const chest={x:824,y:254};
      const nodeCenter=(pathId,step)=>{
        const def=routeDefs.find(p=>p.id===pathId)||routeDefs[1];
        return {x:xs[Math.max(0,Math.min(4,step))],y:def.ys[Math.max(0,Math.min(4,step))]};
      };
      this.refs.treasureStart=start;
      this.refs.treasureChest=chest;
      this.refs.treasureNodeCenter=nodeCenter;
      this.refs.treasureActivePath=state.activePath||null;

      const sky=this.add.graphics();
      const top=Phaser.Display.Color.IntegerToColor(0x63c7ee),bottom=Phaser.Display.Color.IntegerToColor(0xd8f4ff);
      for(let i=0;i<16;i++){
        const col=Phaser.Display.Color.Interpolate.ColorWithColor(top,bottom,15,i);
        sky.fillStyle(Phaser.Display.Color.GetColor(col.r,col.g,col.b),1);
        sky.fillRect(0,i*32,W,33);
      }
      sky.fillStyle(0x5bb65a,1);sky.fillRect(0,365,W,135);
      sky.fillStyle(0x397f43,1);sky.fillRect(0,438,W,62);
      this.add.circle(870,72,42,0xffdf64,.96);

      for(let i=0;i<12;i++){
        const x=18+i*86,y=390+(i%3)*12;
        sky.fillStyle(0x2f713b,.9);sky.fillRect(x-3,y-34,6,35);
        sky.fillStyle(i%2?0x3d964b:0x4ca956,1);sky.fillCircle(x,y-44,18+(i%3)*3);
        sky.fillCircle(x-13,y-38,12);sky.fillCircle(x+13,y-38,12);
      }

      this.add.rectangle(18,78,188,310,0x162b3a,.96).setOrigin(0).setStrokeStyle(3,0xe9c878,.9);
      this.add.text(112,94,'⛏️ THỢ SĂN KHO BÁU',{fontFamily:'Arial',fontSize:'16px',fontStyle:'bold',color:'#fff5cc'}).setOrigin(.5);
      this.add.circle(62,140,28,0xeaf6ff,1).setStrokeStyle(3,0xffffff,.75);
      this.add.image(62,143,'minerTex').setScale(.43);
      const pname=String(o.playerName||'Thí sinh');
      this.add.text(103,128,pname.length>14?pname.slice(0,13)+'…':pname,{fontFamily:'Arial',fontSize:'13px',fontStyle:'bold',color:'#ffffff'});
      this.add.text(103,148,o.className?'Lớp '+o.className:'OLYMPIC HÓA HỌC',{fontFamily:'Arial',fontSize:'11px',color:'#cce5f2'});

      this.add.text(34,184,'ĐIỂM CÂU HỎI',{fontFamily:'Arial',fontSize:'11px',fontStyle:'bold',color:'#d9edf8'});
      this.refs.treasureScore=this.add.text(112,213,String(Math.min(70,state.gameScore||0))+'/70',{...labelStyle(28,'#ffd84b'),strokeThickness:2}).setOrigin(.5);
      this.add.text(34,240,'⏱ THỜI GIAN',{fontFamily:'Arial',fontSize:'11px',fontStyle:'bold',color:'#d9edf8'});
      this.refs.treasureTimer=this.add.text(112,270,this.formatSoccerTime(o.timeLeft??1200),{...labelStyle(25,'#8ee9ff'),strokeThickness:2}).setOrigin(.5);
      this.add.text(34,300,'LUẬT CHƠI',{fontFamily:'Arial',fontSize:'11px',fontStyle:'bold',color:'#ffd991'});
      this.add.text(34,322,'• 3 đường • 5 chặng/đường\n• Đúng mở đường, sai bị chặn\n• Điểm câu hỏi tối đa 70\n• Tới kho báu = đủ 100 điểm',{fontFamily:'Arial',fontSize:'11px',color:'#edf8ff',lineSpacing:4});

      this.add.rectangle(225,18,660,52,0x172c3d,.96).setOrigin(0).setStrokeStyle(3,0xf0cc76,.9);
      this.add.text(555,30,'🏴‍☠️ BẢN ĐỒ ĐÀO KHO BÁU',{fontFamily:'Arial',fontSize:'24px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5,0);
      this.add.text(555,57,'Chọn 1 trong 3 con đường • vượt 5 dấu ? để tới rương',{fontFamily:'Arial',fontSize:'12px',color:'#d8ecf7'}).setOrigin(.5,0);

      this.add.rectangle(222,84,690,348,0xd8b978,1).setOrigin(0).setStrokeStyle(5,0x6d4927,1);
      this.add.rectangle(232,94,670,328,0xe7ca91,1).setOrigin(0).setStrokeStyle(2,0xb28b50,.85);
      const mapG=this.add.graphics();
      mapG.fillStyle(0xb79055,.16);
      for(let i=0;i<45;i++) mapG.fillCircle(242+Math.random()*648,104+Math.random()*308,1+Math.random()*2);

      mapG.lineStyle(14,0x6bbce0,.35);
      mapG.beginPath();mapG.moveTo(250,205);mapG.lineTo(330,214);mapG.lineTo(390,202);mapG.lineTo(470,216);mapG.strokePath();
      mapG.fillStyle(0x94724e,.5);
      for(let x=280;x<860;x+=120){mapG.fillTriangle(x,108,x+24,86,x+48,108);}

      routeDefs.forEach(def=>{
        const st=routeState.get(def.id)||{step:0,blocked:false,blockedAt:null};
        const pts=[start,...def.ys.map((y,i)=>({x:xs[i],y})),chest];
        mapG.lineStyle(14,0x5f452d,.42);
        for(let i=0;i<pts.length-1;i++)mapG.lineBetween(pts[i].x,pts[i].y,pts[i+1].x,pts[i+1].y);
        for(let i=0;i<pts.length-1;i++){
          const dim=st.blocked && st.blockedAt!==null && i>=st.blockedAt;
          mapG.lineStyle(8,dim?0x7c7469:def.color,dim?.25:.84);
          mapG.lineBetween(pts[i].x,pts[i].y,pts[i+1].x,pts[i+1].y);
        }
        this.add.text(263,def.ys[0]-28,def.icon+' '+def.name,{fontFamily:'Arial',fontSize:'10px',fontStyle:'bold',color:'#4a341f'}).setOrigin(0,.5);
      });

      mapG.fillStyle(0xb35f33,1);mapG.fillTriangle(start.x-18,start.y+18,start.x,start.y-20,start.x+18,start.y+18);
      mapG.fillStyle(0xf2d7a5,1);mapG.fillTriangle(start.x-11,start.y+18,start.x,start.y-10,start.x+11,start.y+18);
      this.add.text(start.x,start.y+30,'XUẤT PHÁT',{fontFamily:'Arial',fontSize:'9px',fontStyle:'bold',color:'#5c3d21'}).setOrigin(.5);

      this.drawTreasureChest(chest.x,chest.y,state.finished===true);

      routeDefs.forEach(def=>{
        const st=routeState.get(def.id)||{step:0,blocked:false,blockedAt:null};
        for(let step=0;step<5;step++){
          const p=nodeCenter(def.id,step);
          const isDone=step<Number(st.step||0);
          const isBlocked=!!st.blocked && Number(st.blockedAt)===step;
          const isNext=!st.blocked && step===Number(st.step||0);
          const canChoose=!state.activePath && isNext;
          const canContinue=state.activePath===def.id && isNext;
          const clickable=(canChoose||canContinue) && !state.finished;

          if(isBlocked){
            this.drawTreasureRock(p.x,p.y,20);
            this.add.text(p.x,p.y+28,'BỊ CHẶN',{fontFamily:'Arial',fontSize:'8px',fontStyle:'bold',color:'#7b2828'}).setOrigin(.5);
            continue;
          }
          if(isDone){
            this.add.circle(p.x,p.y,20,0x2f9a62,1).setStrokeStyle(3,0xe9ffe6,.9).setDepth(8);
            this.add.text(p.x,p.y-1,'✓',{fontFamily:'Arial',fontSize:'22px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5).setDepth(9);
            continue;
          }

          const fill=clickable?0xb32f2b:0x8a6a46;
          const alpha=clickable?1:.64;
          const ring=this.add.circle(p.x,p.y,20,fill,alpha).setStrokeStyle(3,clickable?0xffdf70:0xd7bd8f,.95).setDepth(8);
          const qm=this.add.text(p.x,p.y-1,'?',{fontFamily:'Arial',fontSize:'22px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5).setDepth(9);
          this.add.text(p.x,p.y+28,String(step+1),{fontFamily:'Arial',fontSize:'9px',fontStyle:'bold',color:'#5a3e23'}).setOrigin(.5);
          if(clickable){
            this.tweens.add({targets:ring,scale:1.15,alpha:.72,duration:620,yoyo:true,repeat:-1});
            ring.setInteractive({useHandCursor:true});
            ring.on('pointerover',()=>{ring.setScale(1.22);qm.setScale(1.12);});
            ring.on('pointerout',()=>{ring.setScale(1);qm.setScale(1);});
            ring.on('pointerdown',()=>this.triggerTreasureMove({pathId:def.id,step:step,key:def.id+':'+step,type:'question'}));
          }
        }
      });

      let playerPos=start;
      if(state.position?.pathId && Number(state.position.step)>=0){
        playerPos=nodeCenter(state.position.pathId,Number(state.position.step));
      }
      this.refs.treasureHome={x:start.x,y:start.y};
      const halo=this.add.circle(playerPos.x,playerPos.y,25,0xffdf58,.2).setStrokeStyle(3,0xffee9b,.9).setDepth(18);
      this.tweens.add({targets:halo,scale:1.16,alpha:.06,duration:650,yoyo:true,repeat:-1});
      this.refs.treasureHalo=halo;
      this.refs.miner=this.add.image(playerPos.x,playerPos.y-3,'minerTex').setScale(.65).setDepth(22);
      this.add.text(playerPos.x,playerPos.y+28,'BẠN',{fontFamily:'Arial',fontSize:'9px',fontStyle:'bold',color:'#fff4b2',stroke:'#5a3b20',strokeThickness:3}).setOrigin(.5).setDepth(23);

      const active=routeDefs.find(x=>x.id===state.activePath);
      const blockedCount=(state.paths||[]).filter(p=>p.blocked).length;
      this.add.rectangle(222,447,690,38,0x172c3d,.88).setOrigin(0).setStrokeStyle(2,0xffffff,.1);
      this.add.text(567,466,
        active?'Đang đi '+active.name+' • Hãy bấm dấu ? tiếp theo.':'Hãy chọn dấu ? đầu tiên của một con đường. Đường bị chặn: '+blockedCount+'/3',
        {fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#f6fbff'}).setOrigin(.5);
    }
    triggerTreasureMove(target){
      if(this.refs.treasureBusy)return;
      this.refs.treasureBusy=true;
      if(this.refs.onTreasureMove)this.refs.onTreasureMove(target);
    }
    drawTreasureRock(x,y,size=22){
      const g=this.add.graphics().setDepth(10);
      g.fillStyle(0x666f77,1);g.fillCircle(x,y,size);
      g.fillStyle(0x9ca5ac,1);g.fillCircle(x-size*.32,y-size*.28,size*.34);g.fillCircle(x+size*.26,y+size*.12,size*.25);
      g.lineStyle(2,0x4b5359,.95);g.strokeCircle(x,y,size);
      g.fillStyle(0x55462f,1);g.fillRect(x-size*.78,y+size*.7,size*1.55,5);
      return g;
    }
    drawTreasureChest(x,y,open=false){
      const g=this.add.graphics().setDepth(11);
      g.fillStyle(0x7f3719,1);g.fillRoundedRect(x-26,y-3,52,32,6);
      g.fillStyle(0xe0a82f,1);g.fillRect(x-4,y-3,8,32);g.fillRect(x-26,y+10,52,6);
      if(open){
        g.fillStyle(0x522312,1);g.fillRoundedRect(x-26,y-25,52,17,7);
        g.fillStyle(0xffd84b,1);for(let i=0;i<9;i++)g.fillCircle(x-20+i*5,y-8-(i%2)*4,4);
      }else{
        g.fillStyle(0x98451f,1);g.fillRoundedRect(x-26,y-23,52,20,8);g.lineStyle(2,0xe0a82f,1);g.strokeRoundedRect(x-26,y-23,52,20,8);
      }
      this.add.text(x,y+40,'KHO BÁU',{fontFamily:'Arial',fontSize:'10px',fontStyle:'bold',color:'#5b3519'}).setOrigin(.5).setDepth(12);
      return g;
    }
    updateTreasureTimer(sec){
      if(this.refs.treasureTimer){
        this.refs.treasureTimer.setText(this.formatSoccerTime(sec));
        this.refs.treasureTimer.setColor(sec<=60?'#ff9399':'#8ee9ff');
      }
    }
    updateTreasureScore(points){
      if(this.refs.treasureScore)this.refs.treasureScore.setText(String(Math.min(70,points||0))+'/70');
    }
    treasureApproach(target){
      return new Promise(resolve=>{
        const miner=this.refs.miner;
        if(!miner){resolve();return;}
        const p=this.refs.treasureNodeCenter(target.pathId,target.step);
        this.tweens.killTweensOf(miner);
        if(this.refs.treasureHalo)this.refs.treasureHalo.setVisible(false);
        this.tweens.add({
          targets:miner,x:p.x,y:p.y-3,duration:520,ease:'Sine.inOut',
          onComplete:()=>{
            this.popMessage('CHẶNG '+String(target.step+1)+'/5 — TRẢ LỜI ĐỂ MỞ ĐƯỜNG','#fff5d7',C.amber);
            this.time.delayedCall(220,resolve);
          }
        });
      });
    }
    treasureOutcome(ok,target,meta={}){
      return new Promise(resolve=>{
        const miner=this.refs.miner;
        if(!miner){resolve();return;}
        const p=this.refs.treasureNodeCenter(target.pathId,target.step);
        const home=this.refs.treasureStart||{x:miner.x,y:miner.y};
        if(ok){
          for(let i=0;i<14;i++){
            const s=this.add.image(p.x,p.y,'spark').setScale(.3+Math.random()*.22).setTint(i%2?0xffd43b:0x65e6ff).setDepth(35);
            this.tweens.add({targets:s,x:p.x-38+Math.random()*76,y:p.y-48+Math.random()*88,alpha:0,angle:180+Math.random()*240,duration:560+Math.random()*320,onComplete:()=>s.destroy()});
          }
          const msg=(meta.points||0)>0?'ĐÚNG! +10 ĐIỂM — ĐƯỜNG ĐÃ MỞ':'ĐÚNG! ĐƯỜNG ĐÃ MỞ — ĐIỂM ĐÃ ĐẠT TỐI ĐA 70';
          this.popMessage(msg,'#ddffea',C.green);
          this.time.delayedCall(680,resolve);
        }else{
          this.cameras.main.shake(230,.007);
          const rock=this.drawTreasureRock(p.x,p.y,21).setScale(.1);
          this.tweens.add({targets:rock,scale:1,duration:280,ease:'Back.out'});
          this.tweens.add({
            targets:miner,x:home.x,y:home.y-3,duration:620,ease:'Sine.inOut',
            onComplete:()=>{
              this.popMessage('SAI — ĐƯỜNG NÀY ĐÃ BỊ CHẶN! HÃY CHỌN ĐƯỜNG KHÁC','#ffe0e0',C.red);
              this.time.delayedCall(650,resolve);
            }
          });
        }
      });
    }
    treasureWin(meta={}){
      return new Promise(resolve=>{
        const p=this.refs.treasureChest||{x:824,y:254},miner=this.refs.miner;
        if(miner)this.tweens.add({targets:miner,x:p.x-16,y:p.y-3,duration:650,ease:'Sine.inOut'});
        this.time.delayedCall(480,()=>this.drawTreasureChest(p.x,p.y,true));
        for(let i=0;i<42;i++){
          const s=this.add.image(p.x,p.y,'spark').setTint([0xffd43b,0x65e6ff,0xff8dac,0xffffff][i%4]).setScale(.3+Math.random()*.34).setDepth(40);
          this.tweens.add({targets:s,x:p.x-145+Math.random()*290,y:p.y-135+Math.random()*190,angle:360+Math.random()*360,alpha:0,duration:850+Math.random()*750,onComplete:()=>s.destroy()});
        }
        this.popMessage('🏆 MỞ KHO BÁU — THƯỞNG ĐIỂM CHO ĐỦ 100!','#fff5bd',C.yellow);
        this.time.delayedCall(1400,resolve);
      });
    }
    createPlayer(x,y,shirt=0x2c70d6,scale=1){
      const c=this.add.container(x,y).setScale(scale),g=this.add.graphics();
      g.fillStyle(0xf0b58b,1);g.fillCircle(0,-64,18);g.fillStyle(shirt,1);g.fillRoundedRect(-25,-48,50,60,10);g.fillStyle(0x192b3c,1);g.fillRect(-24,9,18,42);g.fillRect(6,9,18,42);g.fillStyle(0xf0b58b,1);g.fillRoundedRect(-41,-40,17,53,8);g.fillRoundedRect(24,-40,17,53,8);g.fillStyle(0x17222b,1);g.fillRect(-31,47,27,9);g.fillRect(5,47,27,9); c.add(g);return c;
    }
    createOwlKeeper(x,y,scale=1){
      const c=this.add.container(x,y).setScale(scale);
      const g=this.add.graphics();
      // shadow
      g.fillStyle(0x082137,.18);g.fillEllipse(0,69,92,20);
      // legs / shoes
      g.lineStyle(12,0xf6c14e,1);g.beginPath();g.moveTo(-20,35);g.lineTo(-24,58);g.moveTo(20,35);g.lineTo(24,58);g.strokePath();
      g.fillStyle(0xffffff,1);g.fillRoundedRect(-43,53,34,13,6);g.fillRoundedRect(9,53,34,13,6);g.fillStyle(0x173a65,1);g.fillRect(-42,62,34,5);g.fillRect(8,62,34,5);
      // body / goalkeeper jersey
      g.fillStyle(0xf8f9fb,1);g.fillRoundedRect(-42,-3,84,54,18);g.lineStyle(4,0x1c68aa,1);g.strokeRoundedRect(-42,-3,84,54,18);
      g.fillStyle(0x1f75bd,1);g.fillRoundedRect(-27,8,54,37,12);g.fillStyle(0xf6d13c,1);g.fillCircle(0,25,12);g.fillStyle(0x173a65,1);g.fillCircle(0,25,7);
      // wings / hands
      g.fillStyle(0xf4a93b,1);g.fillEllipse(-56,12,42,22);g.fillEllipse(56,12,42,22);
      for(let i=0;i<3;i++){g.lineStyle(5,0xf4a93b,1);g.beginPath();g.moveTo(-66-i*3,4+i*6);g.lineTo(-85-i*5,-2+i*3);g.moveTo(66+i*3,4+i*6);g.lineTo(85+i*5,-2+i*3);g.strokePath();}
      // head / owl tufts
      g.fillStyle(0x1562a6,1);g.fillTriangle(-45,-38,-30,-82,-12,-56);g.fillTriangle(45,-38,30,-82,12,-56);g.fillEllipse(0,-36,94,72);
      // eyes and glasses
      g.fillStyle(0xfff3c2,1);g.fillCircle(-21,-39,26);g.fillCircle(21,-39,26);g.lineStyle(5,0xf3c03d,1);g.strokeCircle(-21,-39,26);g.strokeCircle(21,-39,26);g.lineStyle(5,0xf3c03d,1);g.beginPath();g.moveTo(5,-40);g.lineTo(-5,-40);g.strokePath();
      g.fillStyle(0xffffff,1);g.fillCircle(-21,-39,16);g.fillCircle(21,-39,16);g.fillStyle(0x17344b,1);g.fillCircle(-18,-38,8);g.fillCircle(18,-38,8);g.fillStyle(0xffffff,1);g.fillCircle(-15,-42,3);g.fillCircle(15,-42,3);
      // beak
      g.fillStyle(0xf2a22f,1);g.fillTriangle(-9,-20,9,-20,0,-7);
      c.add(g); return c;
    }

    createBeeMiner(x,y,scale=1){
      const c=this.add.container(x,y).setScale(scale);
      const g=this.add.graphics();
      // shadow
      g.fillStyle(0x0d1b24,.18); g.fillEllipse(0,46,68,16);
      // wings
      g.fillStyle(0xeaf8ff,.72); g.fillEllipse(-20,-2,28,18); g.fillEllipse(12,-2,28,18);
      g.lineStyle(2,0xcfe6f2,.9); g.strokeEllipse(-20,-2,28,18); g.strokeEllipse(12,-2,28,18);
      // body
      g.fillStyle(C.yellow,1); g.fillEllipse(0,12,58,40); g.lineStyle(3,0x1a232b,1); g.strokeEllipse(0,12,58,40);
      g.fillStyle(0x1a232b,1); g.fillRect(-14,-3,8,28); g.fillRect(6,-3,8,28);
      // face
      g.fillStyle(0xffd574,1); g.fillCircle(25,6,18); g.lineStyle(3,0x1a232b,1); g.strokeCircle(25,6,18);
      g.fillStyle(0x1a232b,1); g.fillCircle(20,2,3); g.fillCircle(30,2,3); g.lineStyle(2,0x1a232b,1); g.beginPath(); g.moveTo(21,13); g.lineTo(25,16); g.lineTo(29,13); g.strokePath();
      // miner helmet
      g.fillStyle(0xf8c72d,1); g.fillRoundedRect(5,-20,42,16,7); g.fillCircle(26,-22,18); g.lineStyle(3,0x935f12,1); g.strokeRoundedRect(5,-20,42,16,7); g.strokeCircle(26,-22,18);
      g.fillStyle(0xf4f7ff,1); g.fillCircle(26,-22,8); g.lineStyle(2,0xa5b4c2,1); g.strokeCircle(26,-22,8); g.fillStyle(0x6ad6ff,1); g.fillCircle(26,-22,4);
      // feet
      g.lineStyle(5,0x1a232b,1); g.beginPath(); g.moveTo(-10,28); g.lineTo(-14,40); g.moveTo(10,28); g.lineTo(14,40); g.strokePath();
      c.add(g);
      return c;
    }

    drawSoccerChemGarden(){
      const g=this.add.graphics();
      // blue sky
      g.fillStyle(0x53c4f1,1);g.fillRect(0,0,W,150);
      g.fillStyle(0xaeeafd,1);g.fillRect(0,105,W,48);
      // clouds
      for(const [x,y] of [[250,52],[820,45]]){
        g.fillStyle(0xffffff,.88);g.fillCircle(x,y,18);g.fillCircle(x+22,y-8,23);g.fillCircle(x+47,y+1,16);g.fillRoundedRect(x-10,y,72,20,10);
      }
      // school / stands at right
      g.fillStyle(0xe8bf83,1);g.fillRect(785,85,175,92);g.fillStyle(0xc78b5d,1);g.fillRect(785,85,175,12);
      for(let r=0;r<2;r++)for(let c=0;c<4;c++){g.fillStyle(0x6eb6d5,1);g.fillRect(800+c*39,107+r*33,25,20);g.lineStyle(2,0xffffff,.7);g.strokeRect(800+c*39,107+r*33,25,20)}
      // garden hedge / flowers
      g.fillStyle(0x2e9850,1);g.fillRect(0,145,W,78);
      for(let i=0;i<36;i++){const x=(i*43+19)%960,y=157+(i%3)*17;g.fillStyle(i%3===0?0xffdd57:i%3===1?0xff8ca8:0xffffff,1);g.fillCircle(x,y,5);g.fillStyle(0x4e9b45,1);g.fillCircle(x,y+7,3)}
      // grass
      g.fillStyle(0x58b65c,1);g.fillRect(0,210,W,290);
      for(let i=0;i<8;i++){g.fillStyle(i%2?0x55b258:0x4da850,.45);g.fillRect(i*120,210,120,290)}
      // pitch markings
      g.lineStyle(4,0xffffff,.78);g.beginPath();g.moveTo(180,494);g.lineTo(940,494);g.strokePath();
      g.beginPath();g.moveTo(190,320);g.lineTo(930,320);g.strokePath();
      g.strokeCircle(560,463,45);
      // chemistry decorations: flasks and H2O stone
      g.fillStyle(0xf7fbff,.88);g.fillRoundedRect(35,178,52,45,8);g.fillStyle(0x35c4e5,1);g.fillRect(48,198,11,20);g.fillStyle(0xff8d5d,1);g.fillRect(65,193,11,25);
      g.fillStyle(0x8a8e83,1);g.fillEllipse(893,200,78,34);this.add.text(893,198,'H₂O',{fontFamily:'Arial',fontSize:'18px',fontStyle:'bold',color:'#41515a'}).setOrigin(.5);
    }
    showSoccer(o={}){
      this.clearScene();this.mode='soccer';this.drawSoccerChemGarden();
      this.refs.soccerLocked=false;this.refs.onSoccerAnswer=o.onAnswer||null;
      // left contestant / timer / score column
      const panelX=12,panelW=158;
      this.add.rectangle(panelX,10,panelW,118,0x07396a,.95).setOrigin(0).setStrokeStyle(3,0x68d6ff,.85);
      this.add.circle(panelX+79,43,27,0xeef7ff,1).setStrokeStyle(3,0xffffff,.8);
      this.add.circle(panelX+79,39,11,0xa8b7c5,1);this.add.ellipse(panelX+79,67,40,25,0xa8b7c5,1);
      const name=String(o.playerName||'Thí sinh');
      this.add.text(panelX+79,84,name.length>19?name.slice(0,18)+'…':name,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);
      this.add.text(panelX+79,105,o.className?`Lớp ${o.className}`:'OLYMPIC HÓA HỌC',{fontFamily:'Arial',fontSize:'11px',color:'#bfe9ff'}).setOrigin(.5);

      this.add.rectangle(panelX,136,panelW,82,0x063d75,.97).setOrigin(0).setStrokeStyle(3,0x68d6ff,.85);
      this.add.text(panelX+18,150,'⏱  THỜI GIAN',{fontFamily:'Arial',fontSize:'13px',fontStyle:'bold',color:'#e7f8ff'});
      this.refs.soccerTimer=this.add.text(panelX+79,190,this.formatSoccerTime(o.timeLeft??120),{...labelStyle(32,'#ffd844'),strokeThickness:2}).setOrigin(.5);
      this.add.rectangle(panelX,226,panelW,82,0x07396a,.97).setOrigin(0).setStrokeStyle(3,0x68d6ff,.85);
      this.add.text(panelX+18,240,'★  ĐIỂM',{fontFamily:'Arial',fontSize:'13px',fontStyle:'bold',color:'#e7f8ff'});
      this.refs.soccerScore=this.add.text(panelX+79,282,String(o.score??0),{...labelStyle(34,'#ffd844'),strokeThickness:2}).setOrigin(.5);

      // question board like Violympic
      this.add.rectangle(185,13,760,122,0x9b6a25,1).setOrigin(0).setStrokeStyle(4,0x5b3b12,1);
      this.add.rectangle(192,20,746,108,0xfff8c9,1).setOrigin(0).setStrokeStyle(2,0xd8bc67,1);
      this.add.text(215,31,`CÂU ${o.question||1}/${o.total||10}`,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#27854c'});
      const qRaw=String(o.questionText||'');const qFs=qRaw.length>155?16:qRaw.length>105?19:24;const qText=this.add.text(215,55,qRaw,{fontFamily:'Arial',fontSize:`${qFs}px`,fontStyle:'bold',color:'#1e2730',wordWrap:{width:690,useAdvancedWrap:true},lineSpacing:4});
      qText.setOrigin(0,0);

      // goal and net
      const gx=405,gy=151,gw=310,gh=160;
      const net=this.add.graphics();net.lineStyle(8,0xffffff,1);net.strokeRect(gx,gy,gw,gh);net.lineStyle(2,0xdcecf1,.72);
      for(let x=gx+20;x<gx+gw;x+=20){net.beginPath();net.moveTo(x,gy);net.lineTo(x,gy+gh);net.strokePath()}
      for(let y=gy+16;y<gy+gh;y+=16){net.beginPath();net.moveTo(gx,y);net.lineTo(gx+gw,y);net.strokePath()}
      this.refs.net=net;
      // keeper mascot
      const keeper=this.createOwlKeeper(560,250,.78);this.refs.keeper=keeper;
      // ball at kick spot
      const ball=this.add.image(560,470,'soccerBall').setScale(.63);ball.setDepth(8);this.refs.ball=ball;
      this.add.ellipse(560,487,88,15,0x1f7d3d,.35).setDepth(7);

      // answer panels: two columns, two rows
      const options=(o.options||[]).slice(0,4);this.refs.soccerButtons=[];
      const positions=[[365,351],[760,351],[365,417],[760,417]];
      options.forEach((txt,i)=>{
        const [x,y]=positions[i];const c=this.add.container(x,y).setDepth(10);
        const bg=this.add.rectangle(0,0,350,56,0xfff9d7,1).setStrokeStyle(4,0x8b6328,1);
        const badge=this.add.circle(-145,0,22,0x124e9f,1).setStrokeStyle(3,0xffffff,1);
        const letter=this.add.text(-145,0,'ABCD'[i],{fontFamily:'Arial',fontSize:'22px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);
        const fs=String(txt).length>36?16:String(txt).length>24?18:21;
        const t=this.add.text(-112,0,String(txt),{fontFamily:'Arial',fontSize:`${fs}px`,fontStyle:'bold',color:'#202832',wordWrap:{width:270,useAdvancedWrap:true},lineSpacing:1}).setOrigin(0,.5);
        c.add([bg,badge,letter,t]);
        bg.setInteractive({useHandCursor:true});
        bg.on('pointerover',()=>{if(!this.refs.soccerLocked){bg.setFillStyle(0xffef9f,1);c.setScale(1.018)}});
        bg.on('pointerout',()=>{if(!this.refs.soccerLocked){bg.setFillStyle(0xfff9d7,1);c.setScale(1)}});
        bg.on('pointerdown',()=>this.chooseSoccerAnswer(i));
        this.refs.soccerButtons.push({c,bg,badge,letter,t});
      });
      this.add.text(560,334,'CHỌN ĐÁP ÁN ĐỂ THỰC HIỆN CÚ SÚT',{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#eafaff'}).setOrigin(.5).setDepth(9);
    }
    formatSoccerTime(sec){sec=Math.max(0,Math.floor(Number(sec)||0));return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;}
    chooseSoccerAnswer(i){
      if(this.refs.soccerLocked)return;
      this.refs.soccerLocked=true;
      (this.refs.soccerButtons||[]).forEach((b,idx)=>{b.bg.disableInteractive();b.c.setScale(idx===i?1.03:1);b.bg.setFillStyle(idx===i?0xffe36d:0xf3edcf,1);b.badge.setFillStyle(idx===i?0xf0a825:0x607b96,1)});
      if(this.refs.onSoccerAnswer)this.refs.onSoccerAnswer(String(i));
    }
    lockSoccerAnswers(){this.refs.soccerLocked=true;(this.refs.soccerButtons||[]).forEach(b=>b.bg.disableInteractive());}
    unlockSoccerAnswers(){this.refs.soccerLocked=false;(this.refs.soccerButtons||[]).forEach(b=>{b.bg.setInteractive({useHandCursor:true});b.bg.setFillStyle(0xfff9d7,1);b.c.setScale(1);b.badge.setFillStyle(0x124e9f,1)});}
    updateSoccerTimer(sec){if(this.refs.soccerTimer){this.refs.soccerTimer.setText(this.formatSoccerTime(sec));this.refs.soccerTimer.setColor(sec<=30?'#ff8b92':'#ffd844');}}
    updateSoccerScore(v){if(this.refs.soccerScore)this.refs.soccerScore.setText(String(v));}
    soccerOutcome(ok){
      return new Promise(resolve=>{const ball=this.refs.ball,keeper=this.refs.keeper;if(!ball){resolve();return;}const miss=!ok&&Math.random()<.42;
        const kick=this.add.text(560,465,'💥',{fontFamily:'Arial',fontSize:'26px'}).setOrigin(.5).setDepth(12).setAlpha(0);this.tweens.add({targets:kick,alpha:1,scale:1.7,duration:120,yoyo:true,onComplete:()=>kick.destroy()});
        if(ok){
          const side=Math.random()<.5?-1:1;this.tweens.add({targets:keeper,x:keeper.x-side*82,y:keeper.y-18,rotation:-side*.48,duration:520,ease:'Cubic.out'});
          this.tweens.add({targets:ball,x:560+side*92,y:222,scale:.42,angle:540,duration:820,ease:'Cubic.in',onComplete:()=>{this.cameras.main.shake(140,.003);this.netPulse();this.soccerResultBanner('VÀOOOO!  +10 ĐIỂM',true);this.spawnSoccerConfetti();this.time.delayedCall(900,resolve);}});
        }else if(miss){
          this.tweens.add({targets:keeper,x:keeper.x+45,y:keeper.y-24,rotation:.28,duration:500});this.tweens.add({targets:ball,x:820,y:145,scale:.4,angle:620,duration:850,ease:'Cubic.in',onComplete:()=>{this.soccerResultBanner('BÓNG ĐI RA NGOÀI',false);this.time.delayedCall(800,resolve);}});
        }else{
          const side=Math.random()<.5?-1:1;this.tweens.add({targets:keeper,x:keeper.x+side*76,y:keeper.y-35,rotation:side*.62,duration:540,ease:'Cubic.out'});this.tweens.add({targets:ball,x:keeper.x+side*54,y:keeper.y-15,scale:.47,angle:320,duration:610,ease:'Cubic.in',onComplete:()=>{this.tweens.add({targets:ball,y:390,x:keeper.x+side*92,duration:300,ease:'Bounce.out'});this.soccerResultBanner('THỦ MÔN CẢN PHÁ!',false);this.time.delayedCall(900,resolve);}});
        }
      });
    }
    soccerResultBanner(text,good){
      const col=good?0x138c57:0xb7333f;const box=this.add.rectangle(560,304,360,46,col,.96).setDepth(30).setStrokeStyle(3,0xffffff,.75).setScale(.7).setAlpha(0);const t=this.add.text(560,304,text,{...labelStyle(23,'#ffffff'),strokeThickness:2}).setOrigin(.5).setDepth(31).setScale(.7).setAlpha(0);this.tweens.add({targets:[box,t],alpha:1,scale:1,duration:220,ease:'Back.out',hold:450,yoyo:true,onComplete:()=>{box.destroy();t.destroy();}});
    }
    spawnSoccerConfetti(){for(let i=0;i<28;i++){const x=420+Math.random()*280,y=155+Math.random()*70;const s=this.add.image(x,y,'spark').setTint([0xffd43b,0x5ee4ff,0xff7887,0xffffff][i%4]).setScale(.28+Math.random()*.25).setDepth(25);this.tweens.add({targets:s,x:x-60+Math.random()*120,y:y+110+Math.random()*80,angle:300+Math.random()*360,alpha:0,duration:700+Math.random()*500,onComplete:()=>s.destroy()});}}
    netPulse(){const r=this.mode==='soccer'?this.add.rectangle(560,230,310,160,0x9fffc4,.13):this.add.circle((this.refs.netTarget?.x)||480,(this.refs.netTarget?.y)||228,55,0x9fffc4,.15);this.tweens.add({targets:r,alpha:0,scale:1.12,duration:550,onComplete:()=>r.destroy()});}

    showBasketball(o={}){
      this.clearScene();
      this.mode='basketball';
      this.refs.basketLocked=false;
      this.refs.onBasketAnswer=o.onAnswer||null;

      // soft gym background matching approved preview
      const hasScene=this.textures.exists('basketScene');
      if(hasScene){
        this.add.image(W/2,H/2,'basketScene').setDisplaySize(560,500).setAlpha(.98).setDepth(1);
      }else{
        const bg=this.add.graphics();
        bg.fillStyle(0xdedede,1); bg.fillRect(0,0,W,H);
        bg.fillStyle(0xcfcfcf,1); bg.fillRect(140,0,680,H);
        bg.fillStyle(0xe9e9e9,1); bg.fillTriangle(0,H,140,0,140,H); bg.fillTriangle(W,H,W-140,0,W-140,H);
      }
      const bgfx=this.add.graphics();
      bgfx.fillStyle(0x000000,.07); bgfx.fillRect(0,0,W,500);

      // question board
      this.add.rectangle(176,14,768,118,0x4b5661,.94).setOrigin(0).setStrokeStyle(4,0xffffff,.38).setDepth(5);
      this.add.text(196,30,`CÂU ${o.question||1}/${o.total||10}`,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#ffe7a7'}).setDepth(6);
      const qRaw=String(o.questionText||'');
      const qFs=qRaw.length>150?16:qRaw.length>105?19:23;
      this.add.text(196,52,qRaw,{fontFamily:'Arial',fontSize:`${qFs}px`,fontStyle:'bold',color:'#ffffff',wordWrap:{width:720,useAdvancedWrap:true},lineSpacing:4}).setDepth(6);

      // left info panel
      const panelX=10,panelW=150;
      this.add.rectangle(panelX,16,panelW,96,0x31353d,.93).setOrigin(0).setStrokeStyle(3,0xffffff,.18).setDepth(6);
      this.add.circle(panelX+43,48,22,0xeef7ff,1).setStrokeStyle(2,0xffffff,.8).setDepth(7);
      this.add.circle(panelX+43,45,8,0xa8b7c5,1).setDepth(7);
      this.add.ellipse(panelX+43,66,30,18,0xa8b7c5,1).setDepth(7);
      const name=String(o.playerName||'Thí sinh');
      this.add.text(panelX+78,36,name.length>15?name.slice(0,14)+'…':name,{fontFamily:'Arial',fontSize:'13px',fontStyle:'bold',color:'#ffffff'}).setDepth(7);
      this.add.text(panelX+78,56,o.className?`Lớp ${o.className}`:'OLYMPIC HÓA HỌC',{fontFamily:'Arial',fontSize:'10px',color:'#dfebf7'}).setDepth(7);
      this.add.text(panelX+78,79,'BÓNG RỔ',{fontFamily:'Arial',fontSize:'11px',fontStyle:'bold',color:'#ffd788'}).setDepth(7);

      this.add.rectangle(panelX,124,panelW,76,0x31353d,.93).setOrigin(0).setStrokeStyle(3,0xffffff,.18).setDepth(6);
      this.add.text(panelX+16,138,'ĐIỂM',{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#ffffff'}).setDepth(7);
      this.refs.basketScore=this.add.text(panelX+75,166,String(o.score??0),{...labelStyle(28,'#ffd844'),strokeThickness:2}).setOrigin(.5).setDepth(7);

      this.add.rectangle(panelX,212,panelW,76,0x31353d,.93).setOrigin(0).setStrokeStyle(3,0xffffff,.18).setDepth(6);
      this.add.text(panelX+16,226,'THỜI GIAN',{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#ffffff'}).setDepth(7);
      this.refs.basketTimer=this.add.text(panelX+75,255,this.formatSoccerTime(o.timeLeft??120),{...labelStyle(24,'#ffd844'),strokeThickness:2}).setOrigin(.5).setDepth(7);

      // hoop highlight / actor zone using approved composition
      this.add.rectangle(480,250,540,230,0xffffff,0).setStrokeStyle(0,0,0,0).setDepth(3);
      const ball=this.add.image(395,384,'basketBall').setScale(.66).setDepth(12);
      this.refs.ball=ball;
      this.add.ellipse(395,402,78,12,0x000000,.16).setDepth(11);
      // extra front player silhouette if the image asset is missing
      if(!hasScene){
        this.refs.player=this.createPlayer(475,385,0x2c70d6,1.18);
      } else {
        // invisible reference target so outcome animations have a stable anchor
        this.refs.player={x:470,y:394};
      }
      // rim target aligns to approved preview image placed at center
      this.refs.rimTarget={x:480,y:205};
      this.refs.netTarget={x:480,y:228};

      this.add.text(480,414,'CHỌN ĐÁP ÁN ĐỂ THỰC HIỆN CÚ NÉM',{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5).setDepth(8);

      // answer panels around bottom
      const options=(o.options||[]).slice(0,4);
      this.refs.basketButtons=[];
      const positions=[[265,430],[695,430],[265,480],[695,480]];
      options.forEach((txt,i)=>{
        const [x,y]=positions[i];
        const c=this.add.container(x,y).setDepth(20);
        const bg=this.add.rectangle(0,0,350,52,0xffffff,.96).setStrokeStyle(4,0x9a9a9a,1);
        const badge=this.add.circle(-145,0,20,0xf28b25,1).setStrokeStyle(3,0xffffff,1);
        const letter=this.add.text(-145,0,'ABCD'[i],{fontFamily:'Arial',fontSize:'21px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);
        const fs=String(txt).length>34?15:String(txt).length>24?17:20;
        const t=this.add.text(-112,0,String(txt),{fontFamily:'Arial',fontSize:`${fs}px`,fontStyle:'bold',color:'#252a31',wordWrap:{width:270,useAdvancedWrap:true},lineSpacing:1}).setOrigin(0,.5);
        c.add([bg,badge,letter,t]);
        bg.setInteractive({useHandCursor:true});
        bg.on('pointerover',()=>{if(!this.refs.basketLocked){bg.setFillStyle(0xfff2ce,1);c.setScale(1.02);}});
        bg.on('pointerout',()=>{if(!this.refs.basketLocked){bg.setFillStyle(0xffffff,.96);c.setScale(1);}});
        bg.on('pointerdown',()=>this.chooseBasketballAnswer(i));
        this.refs.basketButtons.push({c,bg,badge,letter,t});
      });
    }
    chooseBasketballAnswer(i){
      if(this.refs.basketLocked) return;
      this.refs.basketLocked=true;
      (this.refs.basketButtons||[]).forEach((b,idx)=>{ b.bg.disableInteractive(); b.c.setScale(idx===i?1.03:1); b.bg.setFillStyle(idx===i?0xffd36b:0xf3edcf,1); b.badge.setFillStyle(idx===i?0xd56c1c:0x8a8e95,1); });
      if(this.refs.onBasketAnswer) this.refs.onBasketAnswer(String(i));
    }
    lockBasketballAnswers(){ this.refs.basketLocked=true; (this.refs.basketButtons||[]).forEach(b=>b.bg.disableInteractive()); }
    unlockBasketballAnswers(){ this.refs.basketLocked=false; (this.refs.basketButtons||[]).forEach(b=>{ b.bg.setInteractive({useHandCursor:true}); b.bg.setFillStyle(0xffffff,.96); b.c.setScale(1); b.badge.setFillStyle(0xf28b25,1); }); }
    updateBasketballTimer(sec){ if(this.refs.basketTimer){ this.refs.basketTimer.setText(this.formatSoccerTime(sec)); this.refs.basketTimer.setColor(sec<=30?'#ff8b92':'#ffd844'); } }
    updateBasketballScore(v){ if(this.refs.basketScore) this.refs.basketScore.setText(String(v)); }
    basketballOutcome(ok){
      return new Promise(resolve=>{
        const ball=this.refs.ball;
        const rim=this.refs.rimTarget||{x:480,y:205};
        const net=this.refs.netTarget||{x:480,y:228};
        if(!ball){resolve();return;}
        const start=new Phaser.Math.Vector2(ball.x,ball.y);
        const end=ok?new Phaser.Math.Vector2(rim.x,net.y):new Phaser.Math.Vector2(rim.x+110*(Math.random()<.5?-1:1),rim.y+25);
        const control=new Phaser.Math.Vector2((start.x+rim.x)/2,82);
        const curve=new Phaser.Curves.QuadraticBezier(start,control,end);
        const state={t:0};
        const whoosh=this.add.text(start.x,start.y-20,'🏀',{fontFamily:'Arial',fontSize:'22px'}).setDepth(22).setAlpha(0);
        this.tweens.add({targets:whoosh,alpha:1,scale:1.35,duration:120,yoyo:true,onComplete:()=>whoosh.destroy()});
        this.tweens.add({targets:state,t:1,duration:900,ease:'Sine.inOut',onUpdate:()=>{ const p=curve.getPoint(state.t); ball.setPosition(p.x,p.y); ball.angle+=18; ball.setScale(.66-(state.t*.18)); },onComplete:()=>{
          if(ok){
            this.tweens.add({targets:ball,y:net.y+48,scale:.34,duration:250,ease:'Quad.in'});
            this.netPulse();
            this.basketResultBanner('VÀO RỔ!  +10 ĐIỂM',true);
            for(let i=0;i<18;i++){const s=this.add.image(net.x,net.y,'spark').setTint([0xffd43b,0xffffff,0x7ee4ff][i%3]).setScale(.22+Math.random()*.18).setDepth(25);this.tweens.add({targets:s,x:net.x-55+Math.random()*110,y:net.y-35+Math.random()*90,alpha:0,angle:280+Math.random()*260,duration:600+Math.random()*450,onComplete:()=>s.destroy()});}
            this.time.delayedCall(850,resolve);
          }else{
            this.basketResultBanner('KHÔNG VÀO!',false);
            this.tweens.add({targets:ball,x:end.x+(end.x>rim.x?30:-30),y:end.y+120,angle:ball.angle+220,scale:.45,duration:420,ease:'Bounce.out'});
            this.time.delayedCall(820,resolve);
          }
        }});
      });
    }
    basketResultBanner(text,good){
      const col=good?0x1f8b57:0xba3943;
      const box=this.add.rectangle(480,364,300,44,col,.95).setDepth(30).setStrokeStyle(3,0xffffff,.8).setScale(.7).setAlpha(0);
      const t=this.add.text(480,364,text,{...labelStyle(22,'#ffffff'),strokeThickness:2}).setOrigin(.5).setDepth(31).setScale(.7).setAlpha(0);
      this.tweens.add({targets:[box,t],alpha:1,scale:1,duration:220,ease:'Back.out',hold:420,yoyo:true,onComplete:()=>{box.destroy();t.destroy();}});
    }
    showRacing(o={}){
      this.clearScene();
      this.mode='racing';
      const obstacle=o.obstacle||'rock';
      const question=Math.max(1,o.question||1);
      const total=Math.max(1,o.total||2);
      const progress=clamp(o.progress||0,0,100);
      const overlayKey=obstacle==='puddle'?'racePuddleScene':(obstacle==='bush'?'raceBushScene':'raceRockScene');
      this.add.rectangle(W/2,H/2,W,H,0x79d5ff,1);
      this.add.rectangle(W/2,120,W,240,0x8ddcff,1).setAlpha(.45);
      if(this.textures.exists(overlayKey)){ this.add.image(W/2,315,overlayKey).setDisplaySize(W,320).setAlpha(.18); }
      this.drawRaceLandscape();
      this.addHeader('LÁI XE VƯỢT CHƯỚNG NGẠI VẬT','Xe chạy tới chướng ngại vật • Dừng lại rồi mới xuất hiện câu hỏi',C.cyan);
      const stagePct=((question-1)/Math.max(1,total))*100;
      this.add.rectangle(720,34,190,28,0x061724,.86).setOrigin(0).setStrokeStyle(1,0xffffff,.16);
      this.add.rectangle(727,41,176*stagePct/100,14,C.cyan,1).setOrigin(0);
      this.add.text(815,48,`CHẶNG ${question}/${total}`,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);
      this.add.text(815,74,'ĐÍCH SAU 2 CHƯỚNG NGẠI',{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#c8dce9'}).setOrigin(.5);
      const card=this.add.rectangle(118,52,172,72,0x082436,.82).setStrokeStyle(2,0xffffff,.12); card.setOrigin(0,0);
      this.add.text(204,76,o.playerName||'Người chơi',{fontFamily:'Arial',fontSize:'18px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);
      this.add.text(204,101,o.className||'Mini game 3/3',{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#b7d3e4'}).setOrigin(.5);
      const roadY=404;
      const obstacleX=690;
      const stopX=300;
      const startX=-110;
      this.refs.race={question,total,progress,obstacle,roadY,obstacleX,stopX,startX};
      const car=this.createRaceCar(o.stopped?stopX:startX,roadY,1);
      const obs=this.createRaceObstacle(obstacle,obstacleX,roadY+22);
      this.refs.raceCar=car;
      this.refs.raceObstacle=obs;
      this.refs.raceCar.x = o.stopped?stopX:startX;
      this.add.text(obstacleX,roadY-84, obstacle==='rock'?'HÒN ĐÁ':(obstacle==='puddle'?'VŨNG NƯỚC':'BỤI CÂY'), {...labelStyle(16,'#ffffff'),strokeThickness:2}).setOrigin(.5);
      this.add.rectangle(W/2,H-28,760,30,0x082436,.84).setStrokeStyle(1,0xffffff,.14);
      this.add.text(W/2,H-28,o.stopped?'Xe đã dừng lại. Hãy trả lời câu hỏi để vượt chướng ngại vật.':'Xe đang chạy tới chướng ngại vật...', {fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#eaf7ff'}).setOrigin(.5);
    }
    drawRaceLandscape(){
      const g=this.add.graphics();
      g.fillStyle(0x7ec05e,1); g.fillRect(0,370,W,130);
      g.fillStyle(0x6fb154,1); g.fillRect(0,410,W,90);
      g.fillStyle(0xbfdff1,1); g.fillRect(0,332,W,38);
      g.fillStyle(0xcfd4da,1); g.fillRect(0,300,W,70);
      g.fillStyle(0xe7ebef,1); g.fillRect(0,300,38,200); g.fillRect(W-38,300,38,200);
      g.fillStyle(0xa06b2c,1); g.fillRect(0,166,W,12); g.fillStyle(0xc98b34,1); g.fillRect(0,178,W,16);
      for(let i=0;i<8;i++){ const x=40+i*120; g.fillStyle(0xc98b34,1); g.fillRect(x,145,12,49); g.fillStyle(0x2e8e38,1); g.fillCircle(x+6,130,28); g.fillCircle(x-14,139,18); g.fillCircle(x+22,138,18); }
      for(let i=0;i<14;i++){ const x=28+i*72; g.fillStyle(0x2f8f42,1); g.fillCircle(x,152+(i%2)*8,24); g.fillCircle(x+20,142+(i%3)*6,20); }
      g.fillStyle(0xdfeeff,0.95); g.fillEllipse(156,118,62,34); g.fillEllipse(188,118,68,40); g.fillEllipse(220,118,58,32);
      g.fillEllipse(798,100,72,36); g.fillEllipse(836,100,76,40); g.fillEllipse(878,102,70,34);
      g.fillStyle(0xead766,1); g.fillCircle(820,166,38);
      g.fillStyle(0x8fd95e,1); g.fillRect(0,370,W,16);
      g.fillStyle(0x8fb5c7,1); g.fillRect(0,300,W,4);
      g.fillStyle(0xb0b3b8,1); g.fillRect(0,250,W,120);
      g.fillStyle(0xffffff,0.95);
      for(let i=0;i<7;i++) g.fillRoundedRect(40+i*138,327,84,14,4);
    }
    createRaceCar(x,y,scale=1){
      const c=this.add.container(x,y).setScale(scale);
      const shadow=this.add.ellipse(0,38,150,22,0x000000,.18);
      const body=this.add.graphics();
      body.fillStyle(0x9fc224,1); body.fillRoundedRect(-88,-8,168,52,24);
      body.fillRoundedRect(-36,-22,72,34,16);
      body.fillStyle(0x6a7d35,1); body.fillRoundedRect(-12,-18,46,18,10);
      body.fillStyle(0xffffff,.28); body.fillRoundedRect(-42,0,82,10,5);
      body.fillStyle(0xffd83d,1); body.fillCircle(67,16,8);
      body.fillStyle(0xde4e4e,1); body.fillCircle(-80,23,6);
      const w1=this.add.container(-48,32); const w1g=this.add.graphics(); w1g.fillStyle(0x20252a,1); w1g.fillCircle(0,0,24); w1g.fillStyle(0xdfe4ea,1); w1g.fillCircle(0,0,15); w1.add(w1g);
      const w2=this.add.container(34,32); const w2g=this.add.graphics(); w2g.fillStyle(0x20252a,1); w2g.fillCircle(0,0,24); w2g.fillStyle(0xdfe4ea,1); w2g.fillCircle(0,0,15); w2.add(w2g);
      const kid=this.add.container(-12,-18);
      const head=this.add.graphics(); head.fillStyle(0xf4c39b,1); head.fillCircle(-4,0,20); head.fillStyle(0xffffff,1); head.fillCircle(-10,-2,4); head.fillCircle(2,-2,4); head.fillStyle(0x3a2618,1); head.fillCircle(-10,-2,1.6); head.fillCircle(2,-2,1.6); head.lineStyle(2,0xb55342,1); head.beginPath(); head.moveTo(-10,8); head.lineTo(-4,12); head.lineTo(4,8); head.strokePath();
      const hair=this.add.graphics(); hair.fillStyle(0x8d4923,1); hair.fillCircle(-5,-11,15); hair.fillCircle(-17,-8,8); hair.fillCircle(7,-9,8);
      const cap=this.add.graphics(); cap.fillStyle(0x13a7c5,1); cap.fillEllipse(-2,-18,62,28); cap.fillEllipse(18,-14,34,16);
      const shirt=this.add.graphics(); shirt.fillStyle(0x14a2bf,1); shirt.fillRoundedRect(-24,16,42,24,10);
      kid.add([shirt,head,hair,cap]);
      const wheelMarker1=this.add.rectangle(0,0,4,16,0x9da6ad,1); w1.add(wheelMarker1);
      const wheelMarker2=this.add.rectangle(0,0,4,16,0x9da6ad,1); w2.add(wheelMarker2);
      c.add([shadow,body,w1,w2,kid]);
      c.meta={wheels:[w1,w2],kid};
      return c;
    }
    createRaceObstacle(type,x,y){
      const c=this.add.container(x,y);
      if(type==='puddle'){
        const g=this.add.graphics(); g.fillStyle(0x36bdf6,.95); g.fillEllipse(0,10,176,54); g.fillEllipse(-64,24,92,30); g.fillEllipse(72,18,84,26); g.fillEllipse(-18,0,44,18); g.fillEllipse(98,4,24,14); g.fillStyle(0x7de2ff,.65); g.fillEllipse(12,6,120,20); g.fillStyle(0x36bdf6,.9); g.fillCircle(-42,-20,8); g.fillCircle(-32,-26,5); g.fillCircle(80,-14,7); c.add(g);
      } else if(type==='bush'){
              } else {
        const g=this.add.graphics(); g.fillStyle(0x8f8a84,1); g.fillTriangle(-54,34,-10,-50,54,28); g.fillTriangle(-54,34,4,-38,76,32); g.fillTriangle(-28,10,12,-46,54,28); g.fillStyle(0xa7a19a,1); g.fillTriangle(-22,12,-4,-18,28,18); g.fillTriangle(14,16,34,-10,56,24); g.fillStyle(0x8f8a84,1); [[-78,36,14],[-60,44,10],[64,42,12],[90,34,11]].forEach(s=>g.fillCircle(s[0],s[1],s[2])); c.add(g);
      }
      if(type==='bush'){
        const g=this.add.graphics();
        for(let i=0;i<22;i++){ const angle=(Math.PI*2/22)*i; const px=Math.cos(angle)*(40+Math.random()*22); const py=Math.sin(angle)*(18+Math.random()*14)+10; g.fillStyle([0x4f961b,0x69b823,0x5aa220][i%3],1); g.fillEllipse(px,py,44,24); }
        g.fillStyle(0x3f7d15,1); g.fillEllipse(0,18,130,56); c.add(g);
      }
      c.meta={type}; return c;
    }
    racingApproach(){
      return new Promise(resolve=>{
        const car=this.refs.raceCar, info=this.refs.race;
        if(!car||!info){ resolve(); return; }
        this.tweens.killTweensOf(car);
        this.tweens.addCounter({from:0,to:1,duration:1350,ease:'Sine.inOut',onUpdate:t=>{ const v=t.getValue(); car.x=Phaser.Math.Linear(info.startX,info.stopX,v); car.y=info.roadY + Math.sin(v*Math.PI*5)*2; (car.meta?.wheels||[]).forEach(w=>{ w.rotation += 0.28; }); },onComplete:()=>{ car.x=info.stopX; car.y=info.roadY; this.popMessage('Xe đã dừng lại - câu hỏi xuất hiện!','#e8fbff',C.cyan); resolve(); }});
      });
    }
    racingResult(ok){
      return new Promise(resolve=>{
        const car=this.refs.raceCar, obs=this.refs.raceObstacle;
        if(!car){ resolve(); return; }
        if(ok){
          this.popMessage('TRẢ LỜI ĐÚNG - VƯỢT QUA CHƯỚNG NGẠI!','#effff3',C.green);
          if(obs) this.tweens.add({targets:obs,alpha:.18,scaleX:.92,scaleY:.92,duration:220,yoyo:true,repeat:1});
          this.tweens.addCounter({from:0,to:1,duration:1180,ease:'Cubic.in',onUpdate:t=>{ const v=t.getValue(); car.x=Phaser.Math.Linear(this.refs.race.stopX,W+130,v); car.y=this.refs.race.roadY + Math.sin(v*Math.PI*3)*2; (car.meta?.wheels||[]).forEach(w=>{ w.rotation += 0.34; }); },onComplete:()=>resolve()});
        } else {
          this.cameras.main.shake(280,.006);
          this.tweens.add({targets:car,x:'-=14',duration:100,yoyo:true,repeat:3});
          this.popMessage('TRẢ LỜI SAI - KHÔNG VƯỢT ĐƯỢC CHƯỚNG NGẠI','#ffe4e4',C.red);
          if(obs) this.tweens.add({targets:obs,angle:6,duration:90,yoyo:true,repeat:3});
          this.time.delayedCall(900,resolve);
        }
      });
    }
    popMessage(text,color='#fff',accent=C.yellow){
      const box=this.add.rectangle(W/2,160,520,82,0x061724,.9).setStrokeStyle(3,accent,.9).setScale(.65).setAlpha(0);const t=this.add.text(W/2,160,text,{...labelStyle(30,color),strokeThickness:3}).setOrigin(.5).setScale(.65).setAlpha(0);
      this.tweens.add({targets:[box,t],alpha:1,scale:1,duration:260,ease:'Back.out',hold:520,yoyo:true,onComplete:()=>{box.destroy();t.destroy();}});
    }
  }

  let game=null, scene=null, ready=false;
  function ensure(){
    if(game) return;
    game=new Phaser.Game({
      type:Phaser.AUTO,parent:'phaser-stage',width:W,height:H,transparent:false,backgroundColor:'#071a28',
      antialias:true,render:{pixelArt:false,roundPixels:false},
      scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:W,height:H},
      scene:MainScene
    });
    game.events.once('chem-ready',()=>{scene=game.scene.getScene('Main');ready=true;document.dispatchEvent(new CustomEvent('chem-games-ready'));});
  }
  function withScene(fn){ if(ready&&scene)fn(scene); else document.addEventListener('chem-games-ready',()=>fn(scene),{once:true}); }
  function showTreasure(opts){withScene(s=>s.showTreasure(opts));}
  function showSoccer(opts){withScene(s=>s.showSoccer(opts));}
  function updateSoccerTimer(sec){withScene(s=>s.updateSoccerTimer(sec));}
  function updateSoccerScore(v){withScene(s=>s.updateSoccerScore(v));}
  function updateTreasureTimer(sec){withScene(s=>s.updateTreasureTimer(sec));}
  function updateTreasureScore(v){withScene(s=>s.updateTreasureScore(v));}
  function treasureMoveOpen(target){return new Promise(resolve=>withScene(s=>Promise.resolve(s.treasureMoveOpen(target)).then(resolve)));}
  function treasureApproach(target){return new Promise(resolve=>withScene(s=>Promise.resolve(s.treasureApproach(target)).then(resolve)));}
  function treasureOutcome(ok,target){return new Promise(resolve=>withScene(s=>Promise.resolve(s.treasureOutcome(ok,target)).then(resolve)));}
  function treasureWin(){return new Promise(resolve=>withScene(s=>Promise.resolve(s.treasureWin()).then(resolve)));}
  function lockSoccerAnswers(){withScene(s=>s.lockSoccerAnswers());}
  function unlockSoccerAnswers(){withScene(s=>s.unlockSoccerAnswers());}
  function showBasketball(opts){withScene(s=>s.showBasketball(opts));}
  function updateBasketballTimer(sec){withScene(s=>s.updateBasketballTimer(sec));}
  function updateBasketballScore(v){withScene(s=>s.updateBasketballScore(v));}
  function lockBasketballAnswers(){withScene(s=>s.lockBasketballAnswers());}
  function unlockBasketballAnswers(){withScene(s=>s.unlockBasketballAnswers());}
  function showRacing(opts){withScene(s=>s.showRacing(opts));}
  function racingApproach(){return new Promise(resolve=>withScene(s=>Promise.resolve(s.racingApproach()).then(resolve)));}
  function racingResult(ok,extra={}){return new Promise(resolve=>withScene(s=>Promise.resolve(s.racingResult(ok,extra)).then(resolve)));}
  function outcome(type,ok,extra={}){return new Promise(resolve=>withScene(s=>{let p;if(type==='soccer')p=s.soccerOutcome(ok);else if(type==='basketball')p=s.basketballOutcome(ok);else p=s.racingResult(ok,extra);Promise.resolve(p).then(resolve);}));}
  function destroy(){if(game){game.destroy(true);game=null;scene=null;ready=false;}}

  window.ChemGames={ready:true,ensure,showTreasure,updateTreasureTimer,updateTreasureScore,treasureMoveOpen,treasureApproach,treasureOutcome,treasureWin,showSoccer,updateSoccerTimer,updateSoccerScore,lockSoccerAnswers,unlockSoccerAnswers,showBasketball,updateBasketballTimer,updateBasketballScore,lockBasketballAnswers,unlockBasketballAnswers,showRacing,racingApproach,racingResult,outcome,destroy};
})();
