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
      const c=this.add.container(x,y); const bg=this.add.rectangle(0,0,62,56,fill,.98).setStrokeStyle(2,blocked?0x85909a:0x77bddb,.85);
      const t=this.add.text(0,-2,txt,{...labelStyle(28,blocked?'#d8dde1':selected?'#142533':'#ffffff'),strokeThickness:0}).setOrigin(.5);
      c.add([bg,t]);
      if(!blocked){ bg.setInteractive({useHandCursor:true}); bg.on('pointerover',()=>{bg.setScale(1.05);});bg.on('pointerout',()=>bg.setScale(1));bg.on('pointerdown',()=>{this.selectDirection(dir); if(this.onDirection)this.onDirection(dir);}); }
      return c;
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
    showBee(o={}){
      this.clearScene(); this.mode='bee'; this.addSky(); this.drawHills();
      const g=this.add.graphics(); g.fillStyle(0x4aa84e,1);g.fillRect(0,315,W,185); g.fillStyle(0x3c8f43,1);g.fillRect(0,405,W,95);
      // flowers
      for(let i=0;i<34;i++){const x=18+(i*83)%930,y=365+(i*47)%115;g.fillStyle(i%2?0xfff176:0xff8da1,1);g.fillCircle(x,y,3.7);g.fillStyle(0xffffff,.9);g.fillCircle(x+4,y,3);g.fillCircle(x-4,y,3);g.fillCircle(x,y+4,3);}
      // winding path
      const pathPts=[{x:90,y:340},{x:225,y:285},{x:350,y:350},{x:485,y:290},{x:615,y:350},{x:742,y:290},{x:870,y:338}];
      g.lineStyle(20,0xe6c98b,1);g.beginPath();g.moveTo(pathPts[0].x,pathPts[0].y);for(let i=1;i<pathPts.length;i++)g.lineTo(pathPts[i].x,pathPts[i].y);g.strokePath();
      g.lineStyle(3,0xffffff,.38);g.strokePoints(pathPts,false,false);
      pathPts.forEach((p,i)=>{
        const active=i===clamp(o.step||0,0,6),passed=i<(o.step||0),last=i===pathPts.length-1;
        this.add.circle(p.x,p.y,active?22:16,passed?C.teal:last?C.honey:0xffffff,.94).setStrokeStyle(3,active?C.yellow:0xffffff,.7);
        if(passed)this.add.image(p.x,p.y,'spark').setScale(.7);
      });
      // honey hive
      const hive=this.add.container(884,300); const hg=this.add.graphics(); hg.fillStyle(C.honey,1); [0,1,2,3].forEach(i=>hg.fillRoundedRect(-33+i*2,-38+i*18,66-i*4,23,10)); hg.fillStyle(0x55331d,1);hg.fillEllipse(0,28,22,15); hive.add(hg);
      const step=clamp(o.step||0,0,6),bp=pathPts[step]; const bee=this.add.image(bp.x,bp.y-44,'beeTex').setScale(.78); this.refs.bee=bee;this.refs.pathPts=pathPts;
      this.tweens.add({targets:bee,y:bee.y-8,duration:650,yoyo:true,repeat:-1,ease:'Sine.inOut'});
      this.addHeader('ONG TÌM MẬT','Chọn hướng bay • Trả lời đúng để mở đường');
      this.add.rectangle(790,23,145,48,0x071a29,.8).setOrigin(0).setStrokeStyle(2,0xffffff,.12);this.add.text(862,47,`Đã khóa ${o.blocked?.length||0}/4`,{fontFamily:'Arial',fontSize:'16px',fontStyle:'bold',color:'#ffd9d9'}).setOrigin(.5);
      const bx=820,by=180; this.refs.blocked=o.blocked||[];this.refs.dirButtons={}; this.onDirection=o.onDirection||null;
      this.refs.dirButtons.up=this.makeButton(bx,by-62,'↑','up',this.refs.blocked.includes('up'),o.selected==='up');
      this.refs.dirButtons.left=this.makeButton(bx-66,by,'←','left',this.refs.blocked.includes('left'),o.selected==='left');
      this.refs.dirButtons.right=this.makeButton(bx+66,by,'→','right',this.refs.blocked.includes('right'),o.selected==='right');
      this.refs.dirButtons.down=this.makeButton(bx,by+62,'↓','down',this.refs.blocked.includes('down'),o.selected==='down');
      this.add.text(bx,by+108,'CHỌN HƯỚNG',{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#eef9ff'}).setOrigin(.5);
      // decorative obstacles
      this.add.circle(536,331,18,0x77513c,1);this.add.circle(550,326,15,0x8a6047,1);this.add.circle(526,320,12,0x674230,1);
      this.add.rectangle(690,315,16,65,C.wood,1).setRotation(.48);this.add.rectangle(710,315,16,65,C.wood,1).setRotation(-.48);
    }
    beeOutcome(ok,dir,blockedCount){
      return new Promise(resolve=>{
        const bee=this.refs.bee;if(!bee){resolve();return;}
        if(ok){
          const step=clamp((this.refs.pathPts||[]).findIndex(p=>Math.abs(p.x-bee.x)<2)+1,0,6); const t=(this.refs.pathPts||[])[step];
          this.tweens.killTweensOf(bee);
          const glow=this.add.circle(bee.x,bee.y,30,C.yellow,.24);this.tweens.add({targets:glow,scale:2.1,alpha:0,duration:700});
          for(let i=0;i<12;i++){const s=this.add.image(bee.x,bee.y,'spark').setScale(.35+Math.random()*.35);this.tweens.add({targets:s,x:bee.x-25+Math.random()*50,y:bee.y-65+Math.random()*75,alpha:0,duration:650+Math.random()*350,onComplete:()=>s.destroy()});}
          if(t)this.tweens.add({targets:bee,x:t.x,y:t.y-44,duration:900,ease:'Sine.inOut',onComplete:()=>{this.popMessage('ĐÚNG! ĐƯỜNG ĐÃ MỞ','#d8ffeb',C.green);resolve();}}); else resolve();
        }else{
          this.cameras.main.shake(250,.008); const p=this.directionPoint(dir,bee.x,bee.y); const rock=this.add.container(p.x,p.y); const rg=this.add.graphics();rg.fillStyle(0x66717a,1);rg.fillCircle(0,0,28);rg.fillStyle(0x86929b,1);rg.fillCircle(-8,-8,9);rock.add(rg);rock.setScale(.1);this.tweens.add({targets:rock,scale:1,duration:300,ease:'Back.out'});
          this.tweens.add({targets:bee,x:'-=18',duration:90,yoyo:true,repeat:3,ease:'Sine.inOut'});
          this.popMessage(blockedCount>=4?'HẾT ĐƯỜNG!':'HƯỚNG NÀY BỊ KHÓA','#ffe0e0',C.red);
          this.time.delayedCall(900,resolve);
        }
      });
    }
    directionPoint(dir,x,y){const d={up:[0,-85],down:[0,80],left:[-90,0],right:[90,0]}[dir]||[60,0];return {x:x+d[0],y:y+d[1]};}
    drawStadiumBase(){
      this.addSky(0x69c8ef,0xbceaff);
      const g=this.add.graphics();g.fillStyle(0x172d45,1);g.fillRect(0,130,W,130);g.fillStyle(0x253f59,1);g.fillRect(0,150,W,90);
      for(let row=0;row<4;row++)for(let i=0;i<32;i++){g.fillStyle([0xf8f8f8,0x2a8adb,0xffd34b,0xd84c56][(i+row)%4],.78);g.fillCircle(14+i*31,164+row*18,5)}
      g.fillStyle(0x2b9a50,1);g.fillRect(0,250,W,250);for(let i=0;i<8;i++){g.fillStyle(i%2?0x319f55:0x2c914d,.55);g.fillRect(i*120,250,120,250)}
      g.lineStyle(4,0xffffff,.8);g.strokeRect(570,278,340,190);g.beginPath();g.moveTo(0,470);g.lineTo(W,470);g.strokePath();
    }
    createPlayer(x,y,shirt=0x2c70d6,scale=1){
      const c=this.add.container(x,y).setScale(scale),g=this.add.graphics();
      g.fillStyle(0xf0b58b,1);g.fillCircle(0,-64,18);g.fillStyle(shirt,1);g.fillRoundedRect(-25,-48,50,60,10);g.fillStyle(0x192b3c,1);g.fillRect(-24,9,18,42);g.fillRect(6,9,18,42);g.fillStyle(0xf0b58b,1);g.fillRoundedRect(-41,-40,17,53,8);g.fillRoundedRect(24,-40,17,53,8);g.fillStyle(0x17222b,1);g.fillRect(-31,47,27,9);g.fillRect(5,47,27,9); c.add(g);return c;
    }
    showSoccer(o={}){
      this.clearScene();this.mode='soccer';this.drawStadiumBase();this.addHeader('SÚT BÓNG VÀO LƯỚI','10 câu • 10 điểm/câu • 2 phút/câu',C.green);
      // goal net
      const gx=680,gy=285,gw=220,gh=145; const net=this.add.graphics();net.lineStyle(6,0xffffff,1);net.strokeRect(gx,gy,gw,gh);net.lineStyle(2,0xffffff,.45);for(let x=gx+20;x<gx+gw;x+=20){net.beginPath();net.moveTo(x,gy);net.lineTo(x,gy+gh);net.strokePath()}for(let y=gy+18;y<gy+gh;y+=18){net.beginPath();net.moveTo(gx,y);net.lineTo(gx+gw,y);net.strokePath()}
      this.refs.net=net; this.refs.player=this.createPlayer(210,398,0x1e70c9,1.08);this.refs.player.setRotation(-.04);
      const ball=this.add.image(310,426,'soccerBall').setScale(.62);this.refs.ball=ball;
      const keeper=this.createPlayer(790,375,0xffb000,.86);this.refs.keeper=keeper;
      this.add.circle(310,451,8,0xffffff,.8);this.add.text(480,288,'KHU VỰC 16m50',{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#ffffff88'});
      this.add.rectangle(28,432,235,42,0x061724,.76).setOrigin(0).setStrokeStyle(1,0xffffff,.15);this.add.text(145,453,'Trả lời đúng để ghi bàn!',{fontFamily:'Arial',fontSize:'16px',fontStyle:'bold',color:'#eaf9ff'}).setOrigin(.5);
    }
    soccerOutcome(ok){
      return new Promise(resolve=>{const ball=this.refs.ball,keeper=this.refs.keeper;if(!ball){resolve();return;}const miss=!ok&&Math.random()<.45;
        this.tweens.add({targets:this.refs.player,rotation:.16,duration:160,yoyo:true});
        if(ok){this.tweens.add({targets:keeper,x:keeper.x-72,y:keeper.y-35,rotation:-.55,duration:540,ease:'Cubic.out'});this.tweens.add({targets:ball,x:840,y:345,scale:.42,angle:520,duration:880,ease:'Cubic.in',onComplete:()=>{this.cameras.main.shake(160,.004);this.popMessage('GOAL! +10','#eafff2',C.green);this.netPulse();this.time.delayedCall(650,resolve);}});}
        else if(miss){this.tweens.add({targets:keeper,x:keeper.x+40,y:keeper.y-45,rotation:.45,duration:520});this.tweens.add({targets:ball,x:930,y:245,scale:.43,angle:600,duration:900,ease:'Cubic.in',onComplete:()=>{this.popMessage('BÓNG ĐI RA NGOÀI','#ffe4e4',C.red);this.time.delayedCall(500,resolve);}});}
        else{this.tweens.add({targets:keeper,x:690,y:338,rotation:-.7,duration:560,ease:'Cubic.out'});this.tweens.add({targets:ball,x:708,y:350,scale:.48,angle:300,duration:620,ease:'Cubic.in',onComplete:()=>{this.tweens.add({targets:ball,x:660,y:405,duration:280});this.popMessage('THỦ MÔN CẢN PHÁ!','#ffe4e4',C.red);this.time.delayedCall(560,resolve);}});}
      });
    }
    netPulse(){const r=this.add.rectangle(790,357,215,140,0x9fffc4,.13);this.tweens.add({targets:r,alpha:0,scale:1.08,duration:550,onComplete:()=>r.destroy()});}
    showBasketball(o={}){
      this.clearScene();this.mode='basketball';
      // arena wall
      const bg=this.add.graphics(); bg.fillStyle(0x162338,1);bg.fillRect(0,0,W,270);bg.fillStyle(0x24344d,1);bg.fillRect(0,80,W,170);
      for(let row=0;row<5;row++)for(let i=0;i<35;i++){bg.fillStyle([0xf8f8f8,0xf7ba3c,0x4e86d7,0xe35b67][(i+row)%4],.72);bg.fillCircle(8+i*28,110+row*24,5)}
      bg.fillStyle(0xc9793a,1);bg.fillRect(0,250,W,250);for(let i=0;i<12;i++){bg.fillStyle(i%2?0xcf8547:0xc17438,.38);bg.fillRect(i*80,250,80,250)}
      bg.lineStyle(5,0xffffff,.7);bg.strokeCircle(480,470,165);bg.beginPath();bg.moveTo(0,470);bg.lineTo(W,470);bg.strokePath();
      this.addHeader('NÉM BÓNG VÀO RỔ','10 câu • 10 điểm/câu • 2 phút/câu',C.orange);
      // board and hoop
      this.add.rectangle(800,165,125,88,0xf4fbff,.93).setStrokeStyle(5,0x54636f,1);this.add.rectangle(800,173,54,40,0xffffff,0).setStrokeStyle(3,0xd95c45,1);
      const rim=this.add.ellipse(800,223,78,20,0xd95c45,0).setStrokeStyle(7,0xd95c45,1); this.refs.rim=rim;
      const ng=this.add.graphics();ng.lineStyle(2,0xffffff,.75);for(let i=-28;i<=28;i+=14){ng.beginPath();ng.moveTo(800+i,230);ng.lineTo(800+i*.55,284);ng.strokePath()}ng.lineStyle(2,0xffffff,.55);[244,258,272].forEach(y=>{ng.beginPath();ng.moveTo(775,y);ng.lineTo(825,y);ng.strokePath()});
      this.refs.player=this.createPlayer(230,404,0x8d4fc5,1.13); const ball=this.add.image(330,358,'basketBall').setScale(.72);this.refs.ball=ball;
      this.add.text(478,340,'FREE THROW',{fontFamily:'Arial',fontSize:'18px',fontStyle:'bold',color:'#ffffff66'}).setOrigin(.5);
      this.add.rectangle(25,432,250,42,0x101b2c,.8).setOrigin(0).setStrokeStyle(1,0xffffff,.15);this.add.text(150,453,'Đúng = SWISH! 🏀',{fontFamily:'Arial',fontSize:'16px',fontStyle:'bold',color:'#fff1df'}).setOrigin(.5);
    }
    basketballOutcome(ok){
      return new Promise(resolve=>{const ball=this.refs.ball;if(!ball){resolve();return;}const start=new Phaser.Math.Vector2(ball.x,ball.y),control=new Phaser.Math.Vector2(565,75),end=ok?new Phaser.Math.Vector2(800,235):new Phaser.Math.Vector2(835,212);const curve=new Phaser.Curves.QuadraticBezier(start,control,end);const state={t:0};
        this.tweens.add({targets:this.refs.player,rotation:-.12,duration:180,yoyo:true});
        this.tweens.add({targets:state,t:1,duration:980,ease:'Sine.inOut',onUpdate:()=>{const p=curve.getPoint(state.t);ball.setPosition(p.x,p.y);ball.angle+=18;},onComplete:()=>{
          if(ok){this.tweens.add({targets:ball,y:320,scale:.55,duration:330,ease:'Quad.in',onComplete:()=>{this.popMessage('SWISH! +10','#fff4df',C.orange);for(let i=0;i<12;i++){const s=this.add.image(800,235,'spark').setTint(0xffc54d).setScale(.35);this.tweens.add({targets:s,x:760+Math.random()*80,y:200+Math.random()*90,alpha:0,duration:650,onComplete:()=>s.destroy()});}this.time.delayedCall(600,resolve);}});}
          else{this.tweens.add({targets:ball,x:750,y:365,angle:ball.angle+360,duration:520,ease:'Bounce.out'});this.tweens.add({targets:this.refs.rim,scaleX:1.08,duration:90,yoyo:true,repeat:2});this.popMessage('BẬT VÀNH!','#ffe4e4',C.red);this.time.delayedCall(850,resolve);}
        }});
      });
    }
    showRacing(o={}){
      this.clearScene();this.mode='racing';this.addSky(0x75cff4,0xc5efff);this.drawHills();this.addHeader('LÁI XE VƯỢT CHƯỚNG NGẠI','4 ý Đúng/Sai • Tối đa 50 điểm/câu • 10 phút/câu',C.cyan);
      // trees
      const scenery=this.add.graphics();for(let i=0;i<12;i++){const x=35+i*84,y=300+(i%3)*16;scenery.fillStyle(0x81522f,1);scenery.fillRect(x-4,y,8,38);scenery.fillStyle(0x2c8b49,1);scenery.fillCircle(x,y-8,24);scenery.fillCircle(x-15,y,16);scenery.fillCircle(x+15,y,16)}
      // perspective road
      const road=this.add.graphics();road.fillStyle(C.road,1);road.fillTriangle(210,H,750,H,590,260);road.fillTriangle(210,H,590,260,370,260);road.lineStyle(8,0xf1cc4f,1);road.beginPath();road.moveTo(210,H);road.lineTo(370,260);road.moveTo(750,H);road.lineTo(590,260);road.strokePath();
      road.lineStyle(5,0xffffff,.8);for(let i=0;i<6;i++){const y=292+i*39,w=6+i*7;road.beginPath();road.moveTo(480-w,y);road.lineTo(480+w,y+22);road.strokePath();}
      const progress=clamp(o.progress||0,0,100); const bx=330+(progress/100)*300, by=424-(progress/100)*80;
      const bike=this.createBike(bx,by,.92-(progress/100)*.12);this.refs.bike=bike;this.refs.raceStart={x:bx,y:by};this.refs.progress=progress;
      // obstacle ahead
      const obsX=570+(progress*.8),obsY=360-(progress*.25);this.createBarrier(clamp(obsX,560,720),clamp(obsY,305,365));
      // finish
      this.add.rectangle(620,278,7,82,0xf5f5f5,1);this.add.rectangle(628,278,58,38,0xffffff,1).setOrigin(0,0);for(let r=0;r<4;r++)for(let c=0;c<6;c++)if((r+c)%2===0)this.add.rectangle(633+c*9,283+r*8,9,8,0x111111,1);
      // progress meter
      this.add.rectangle(735,35,190,28,0x061724,.82).setOrigin(0).setStrokeStyle(1,0xffffff,.16);this.add.rectangle(742,42,176*(progress/100),14,C.cyan,1).setOrigin(0);this.add.text(830,49,`${Math.round(progress)}%`,{fontFamily:'Arial',fontSize:'14px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);
      this.add.text(830,75,'TIẾN ĐỘ ĐẾN ĐÍCH',{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#c8dce9'}).setOrigin(.5);
    }
    createBike(x,y,scale=1){
      const c=this.add.container(x,y).setScale(scale),g=this.add.graphics();g.fillStyle(0x151a1e,1);g.fillCircle(-35,20,25);g.fillCircle(38,20,25);g.fillStyle(0x8d99a2,1);g.fillCircle(-35,20,15);g.fillCircle(38,20,15);g.lineStyle(8,C.red,1);g.beginPath();g.moveTo(-35,20);g.lineTo(-5,-16);g.lineTo(26,17);g.lineTo(-17,12);g.lineTo(15,-10);g.strokePath();g.lineStyle(7,0x27313a,1);g.beginPath();g.moveTo(15,-10);g.lineTo(31,-34);g.moveTo(23,-31);g.lineTo(43,-31);g.strokePath();g.fillStyle(0x25303a,1);g.fillRoundedRect(-16,-28,35,12,5);g.fillStyle(0xf0b58b,1);g.fillCircle(-5,-63,12);g.fillStyle(0x1f70c5,1);g.fillRoundedRect(-19,-52,30,31,8);g.lineStyle(6,0x1f70c5,1);g.beginPath();g.moveTo(5,-37);g.lineTo(28,-25);g.strokePath();c.add(g);return c;
    }
    createBarrier(x,y){const c=this.add.container(x,y),g=this.add.graphics();g.fillStyle(0x574338,1);g.fillRect(-42,21,8,35);g.fillRect(34,21,8,35);g.fillStyle(0xfff4e6,1);g.fillRoundedRect(-48,-5,96,28,5);for(let i=-45;i<45;i+=24){g.fillStyle(C.orange,1);g.fillTriangle(i,-5,i+13,-5,i+1,23);}c.add(g);return c;}
    racingOutcome(points){
      return new Promise(resolve=>{const bike=this.refs.bike;if(!bike){resolve();return;}const add=points>=50?42:points>=25?28:points>=15?18:points>=5?10:4;const target=clamp((this.refs.progress||0)+add,0,100);const dx=(target-(this.refs.progress||0))*3.0,dy=-(target-(this.refs.progress||0))*.8;
        if(points>0){this.tweens.add({targets:bike,x:bike.x+dx,y:bike.y+dy,duration:1000,ease:'Cubic.out',onUpdate:()=>{bike.rotation=Math.sin(this.time.now/80)*.02},onComplete:()=>{bike.rotation=0;this.popMessage(`+${points} ĐIỂM • TĂNG TỐC!`,'#e8fbff',C.cyan);this.time.delayedCall(550,resolve);}});}
        else{this.cameras.main.shake(280,.007);this.tweens.add({targets:bike,x:'-=12',duration:95,yoyo:true,repeat:3});this.popMessage('CHƯA VƯỢT ĐƯỢC CHƯỚNG NGẠI','#ffe4e4',C.red);this.time.delayedCall(850,resolve);}
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
  function showBee(opts){withScene(s=>s.showBee(opts));}
  function showSoccer(opts){withScene(s=>s.showSoccer(opts));}
  function showBasketball(opts){withScene(s=>s.showBasketball(opts));}
  function showRacing(opts){withScene(s=>s.showRacing(opts));}
  function outcome(type,ok,extra={}){return new Promise(resolve=>withScene(s=>{let p;if(type==='bee')p=s.beeOutcome(ok,extra.direction,extra.blockedCount||0);else if(type==='soccer')p=s.soccerOutcome(ok);else if(type==='basketball')p=s.basketballOutcome(ok);else p=s.racingOutcome(extra.points||0);Promise.resolve(p).then(resolve);}));}
  function selectDirection(dir){withScene(s=>s.selectDirection(dir));}
  function destroy(){if(game){game.destroy(true);game=null;scene=null;ready=false;}}

  window.ChemGames={ready:true,ensure,showBee,showSoccer,showBasketball,showRacing,outcome,selectDirection,destroy};
})();
